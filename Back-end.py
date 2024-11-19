from PyP100 import PyP110, PyL530
import time
import pyrebase
import vonage

# Configurations réseau et Firebase
plug_ip = '192.168.204.223'
lamp_ip = '172.20.10.4'
email = 'armunda2020@gmail.com'
password = 'Kinshasa2@2@'

firebaseConfig = {
  'apiKey': "AIzaSyBnBqgkIAVpPwUX_rPKNpZ3G367g07IBbw",
  'authDomain': "voda-house-9ed6d.firebaseapp.com",
  'databaseURL': "https://voda-house-9ed6d-default-rtdb.firebaseio.com",
  'projectId': "voda-house-9ed6d",
  'storageBucket': "voda-house-9ed6d.appspot.com",
  'messagingSenderId': "686192896938",
  'appId': "1:686192896938:web:785a024be47302836159d3"
}

# Configuration SMS
client = vonage.Client(key="2eb6fdcd", secret="OM4B4mDW3QT047Sq")
sms = vonage.Sms(client)

firebase = pyrebase.initialize_app(firebaseConfig)
db = firebase.database()

previous_courant_state = True

# Connexion à la prise
def try_connect_plug(plug_ip):
    plug = PyP110.P110(plug_ip, email, password)
    try:
        plug.handshake()
        plug.login()
        return plug
    except Exception as e:
        print(f"Echec de connexion à la prise {plug_ip}: {e}")
        return None

# Connexion à la lampe
def try_connect_lamp(lamp_ip):
    lamp = PyL530.L530(lamp_ip, email, password)
    try:
        lamp.handshake()
        lamp.login()
        return lamp
    except Exception as e:
        print(f"Echec de connexion à la lampe {lamp_ip}: {e}")
        return None

# Mise à jour de l'état de la lampe
def update_lamp_state(lamp, state, intensity, firebase_path):
    if lamp is not None:
        try:
            if state:
                lamp.turnOn()
                lamp.setBrightness(intensity)
            else:
                lamp.turnOff()
            db.child(firebase_path).update({'etat': state, 'intensity': intensity})
            print(f"Lampe {firebase_path} {'allumée' if state else 'éteinte'} à {intensity}%")
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la lampe: {e}")

# Mise à jour de la consommation énergétique de la prise
def update_energy_usage(plug, firebase_path):
    if plug is not None:
        try:
            energy_data = plug.getEnergyUsage()
            month_energy_wh = energy_data.get('month_energy', 0)
            month_energy_kwh = month_energy_wh / 1000.0
            db.child("PriseState").update({firebase_path: month_energy_kwh})
            print(f"Mise à jour de la consommation: {month_energy_kwh} kWh")
        except Exception as e:
            print(f"Erreur lors de la mise à jour de la consommation: {e}")

# Vérification de l'état courant
def check_and_update_connection_state(plug, lamp, etat_prise):
    global previous_courant_state
    current_state = plug is not None

    lamp_data = db.child("LampState").get().val() or {'etat': False, 'intensity': 0}

    if current_state != previous_courant_state:
        db.child("PriseState").update({"EtatCourant": current_state})
        if not current_state:
            sms.send_message({
                "from": "VODA-HOUSE",
                "to": "243821745904",
                "text": "Coupure du courant !",
            })
        else:
            print("Rétablissement du courant")
            update_energy_usage(plug, "Prise_energy")
            sms.send_message({
                "from": "VODA-HOUSE",
                "to": "243821745904",
                "text": f"Rétablissement du courant:\n"
                        f"Prise {'allumée' if etat_prise else 'éteinte'}\n"
                        f"Lampe {'allumée' if lamp_data['etat'] else 'éteinte'} à {lamp_data['intensity']}%"
            })

        previous_courant_state = current_state

# Tentative de reconnexion
def attempt_reconnect(device_ip, connect_function):
    for attempt in range(1):
        print(f"Tentative de reconnexion {attempt+1} à l'appareil {device_ip}...")
        device = connect_function(device_ip)
        if device is not None:
            return device
        time.sleep(1)
    return None

# Boucle principale
def main_loop():
    global previous_courant_state
    plug = try_connect_plug(plug_ip)
    lamp = try_connect_lamp(lamp_ip)
    etat_prise = False

    check_and_update_connection_state(plug, lamp, etat_prise)

    while True:
        try:
            etat_prise = db.child("PriseState").get().val().get('prise', False)
            lamp_data = db.child("LampState").get().val() or {'etat': False, 'intensity': 0}
            update_lamp_state(lamp, lamp_data['etat'], lamp_data['intensity'], "LampState")

            if plug is not None:
                if etat_prise:
                    plug.turnOn()
                    print("Prise allumée")
                else:
                    plug.turnOff()
                    print("Prise éteinte")
            else:
                plug = attempt_reconnect(plug_ip, try_connect_plug)

            check_and_update_connection_state(plug, lamp, etat_prise)
        except Exception as e:
            print(f"Erreur : {e}")
            plug, lamp = None, None
        time.sleep(1)

if __name__ == "__main__":
    main_loop()
