import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Avatar, Paragraph, Provider } from 'react-native-paper';
import { db } from '../config';
import { ref, onValue } from 'firebase/database';

const HomeScreen = () => {
  const [courant, setCourant] = useState();
  const [energieLampeExterne, setEnergieLampeExterne] = useState(0);
  const [energieLampeChambre, setEnergieLampeChambre] = useState(0);
  const [energieRefrigerateur, setEnergieRefrigerateur] = useState(0);
  const [energieTelevision, setEnergieTelevision] = useState(0);


  useEffect(() => {
    const courantRef = ref(db, 'PriseState/Etat_Courant');
    onValue(courantRef, (snapshot) => {
      const etatCourant = snapshot.val();
      setCourant(etatCourant);
    });
  }, []);

  useEffect(() => {
    const lampeExterneRef = ref(db, 'LampExterne/energy');
    const lampeChambreRef = ref(db, 'LampChambre/energy');
    const refrigerateurRef = ref(db, 'PriseState/Refrigerateur_energy');
    const televisionRef = ref(db, 'PriseState/Television_energy');
  
    const unsubscribeLampeExterne = onValue(lampeExterneRef, snapshot => {
      const energy = snapshot.val() || 0;
      setEnergieLampeExterne(energy);
    });
  
    const unsubscribeLampeChambre = onValue(lampeChambreRef, snapshot => {
      const energy = snapshot.val() || 0;
      setEnergieLampeChambre(energy);
    });
  
    const unsubscribeRefrigerateur = onValue(refrigerateurRef, snapshot => {
      const energy = snapshot.val() || 0;
      setEnergieRefrigerateur(energy);
    });
  
    const unsubscribeTelevision = onValue(televisionRef, snapshot => {
      const energy = snapshot.val() || 0;
      setEnergieTelevision(energy);
    });
  
    return () => {
      unsubscribeLampeExterne();
      unsubscribeLampeChambre();
      unsubscribeRefrigerateur();
      unsubscribeTelevision();
    };
  }, []);

  const energieAccumuleeStatique = energieLampeExterne + energieLampeChambre + energieRefrigerateur + energieTelevision;
  const estimationCoutStatique = energieAccumuleeStatique * 100;
  return (
    <Provider>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Content titleStyle={styles.headerTitle} title="MY VODA-HOUSE" />
        </Appbar.Header>
        <ScrollView style={styles.scrollContainer}>

        <Card style={styles.card}>
  <Card.Content>
    <View style={styles.statusRow}>
      <Avatar.Icon
        icon="alert-outline"
        style={{
          backgroundColor: courant ? "#fff" : "#fff", 
          color: courant ? "green" : "black",
          right: 15 
        }}
        color={courant ? "green" : "red"}
      />
      <Text style={{ marginLeft: 10, color: courant ? "black" : "red", fontWeight:"bold", fontSize:17, top:5, right: 21, textAlign:"center" }}>
        {courant ? "IL Y'A DU COURANT A LA MAISON" : "COUPURE DU COURANT A LA MAISON"}
      </Text>
    </View>
  </Card.Content>
</Card>

          
          <Card style={styles.card}>
            <Card.Title title="CONSOMMATION GLOBALE" titleStyle={styles.cardTitle} />
            <Card.Content>
              <Avatar.Icon
                size={60}
                icon="lightbulb-on-outline"
                style={styles.avatar}
              />
              <View style={styles.consumptionBubble}>
                <Text style={styles.consumptionText}>
                  {energieAccumuleeStatique.toFixed(4)} kWh
                </Text>
              </View>
              <Paragraph style={styles.priceText}>
                ESTIMATION DU COÛT: {estimationCoutStatique.toFixed(1)} Fc
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="CONSOMMATION PAR EQUIPEMENT" titleStyle={styles.cardTitle} />
            <Card.Content>

            <View style={styles.consumptionRow}>
  <Text style={styles.consumptionTextLeft}>LAMPE EXTERIEURE:</Text>
  <Text style={styles.consumptionTextRight}>{energieLampeExterne.toFixed(2)} kWh</Text>
</View>
<View style={styles.consumptionRow}>
  <Text style={styles.consumptionTextLeft}>LAMPE CHAMBRE 1 :</Text>
  <Text style={styles.consumptionTextRight}>{energieLampeChambre.toFixed(2)} kWh</Text>
</View>
<View style={styles.consumptionRow}>
  <Text style={styles.consumptionTextLeft}>RÉFRIGÉRATEUR :</Text> 
  <Text style={styles.consumptionTextRight}>{energieRefrigerateur.toFixed(2)} kWh</Text>
</View>
<View style={styles.consumptionRow}>
  <Text style={styles.consumptionTextLeft}>TÉLÉVISION :</Text>
  <Text style={styles.consumptionTextRight}>{energieTelevision.toFixed(2)} kWh</Text>
</View>

            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: "#E60000",
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 10,
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  consumptionBubble: {
    backgroundColor: '#E60000',
    padding: 10,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  consumptionText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  consumptionTextLeft: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  consumptionTextRight: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: '#E60000',
  },
  consumptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  consumptionTextLeft: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  consumptionTextRight: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
});

export default HomeScreen;
