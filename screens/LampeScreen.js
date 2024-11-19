import React, { useState, useEffect } from 'react';
import { View, Switch, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import firebase from 'firebase/compat';
import { db } from '../config';
import { ref, onValue, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Slider from '@react-native-community/slider';


const LampeScreen = () => {
  const [lampe_chambre, setLampe_chambre] = useState(false);
  const [lampe_externe, setLampe_externe] = useState(false);
  const [courant, setCourant] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lampe_chambre_energy, setLampe_chambre_energy] = useState("");
  const [lampe_externe_energy, setLampe_externe_energy] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentIntensity, setCurrentIntensity] = useState(0);
  const [activeLampe, setActiveLampe] = useState('');
  const [lampe_chambre_intensity, setLampe_chambre_intensity] = useState(0);
  const [lampe_externe_intensity, setLampe_externe_intensity] = useState(0);

  useEffect(() => {
    const courantRef = ref(db, 'PriseState/EtatCourant');
    onValue(courantRef, (snapshot) => { 
      const etatCourant = snapshot.val();
      setCourant(etatCourant);
    });

    const lampeExterneRef = ref(db, 'LampExterne');
      onValue(lampeExterneRef, (snapshot) => {
      const data = snapshot.val();
      setLampe_externe(data.etat || false);
      setLampe_externe_energy(`${data.energy || 0} kW`);
      setLampe_externe_intensity(data.intensity || 0);
    });

    const lampe_chambreRef = ref(db, 'LampChambre');
      onValue(lampe_chambreRef, (snapshot) => {
      const data = snapshot.val();
      setLampe_chambre(data.etat || false);
      setLampe_chambre_energy(`${data.energy || 0} kW`);
      setLampe_chambre_intensity(data.intensity || 0); 
    });
    
  }, []);

  const togglePriseState = (lampeName, currentState) => {
    if (!courant) return;
    const newState = !currentState;
  
    update(ref(db, `Lamp${lampeName}`), {
      etat: newState,
    });
  };
  const handleOpenModal = (lampeName, currentEnergy) => {
    setActiveLampe(lampeName);
    setCurrentIntensity(currentIntensity);
    setModalVisible(true);
  };
  
  const handleIntensityChange = (value) => {
    setCurrentIntensity(value);
    update(ref(db, `Lamp${activeLampe}`), {
      intensity: value,
    });
  };
  

  const iconPaths = {
    export: require('../assets/icons/export.png'),
    bed: require('../assets/icons/bed.png'),
    cuisine: require('../assets/icons/cuisine.png'),
    chair: require('../assets/icons/chair.png'),
    bathroom: require('../assets/icons/bathroom.png'),
    magasin: require('../assets/icons/magasin.png'),
    toilet: require('../assets/icons/toilet.png'),
  };
  
  const renderBox = (imageName, isSwitchEnabled, switchValue, lampeName, label, energy, intensity) => {
    const iconSource = iconPaths[imageName] || require('../assets/icons/television.png'); 
    return (
      <View style={styles.boxContainer}>
        <View style={styles.box}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => handleOpenModal(lampeName, intensity)}>
            <Image source={iconSource} style={styles.icon} />
            <Text style={styles.energyText}>{energy}</Text>
          </TouchableOpacity>
          <Switch
            trackColor={{ false: "#767577", true: "#E60000" }}
            thumbColor={isEnabled ? "gray" : "#f4f3f4"} 
            ios_backgroundColor="gray"
            value={switchValue}
            onValueChange={() => togglePriseState(lampeName, switchValue)}
            disabled={!courant || !isSwitchEnabled}
            style={styles.switch}
          />
          <Text style={styles.label}>{label}</Text>
        </View>
        {isSwitchEnabled && courant && (
          <TouchableOpacity style={styles.button} onPress={() => handleOpenModal(lampeName, intensity)}>
            <Text style={styles.buttonText}>Luminosité</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  
  };
  

  return (
    <ScrollView style={styles.verticalScroll}>
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("bed", true, lampe_chambre, 'Chambre', "Chambre", lampe_chambre_energy, lampe_chambre_intensity)}
        {renderBox("export", true, lampe_externe, 'Externe', "Lampe exterieure", lampe_externe_energy, lampe_externe_intensity)}
        {renderBox("cuisine", false, false, null, "cuisine", "-")}
        {renderBox("chair", false, false, null, "Salle à manger", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("bathroom", false, false, null, "Salle de bain 1", "-")}
        {renderBox("bathroom", false, false, null, "Salle de bain 2", "-")}
        {renderBox("bathroom", false, false, null, "Salle de bain 3", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("magasin", false, false, null, "Magasin", "-")}
        {renderBox("bed", false, false, null, "Chambre 2", "-")}
        {renderBox("bed", false, false, null, "Chambre 3", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("toilet", false, false, null, "Toilette exterieur", "-")}
      </ScrollView>
    </View>
    <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
  <View style={{backgroundColor: 'white', padding: 20}}>
    <Text style={{fontSize: 18, marginBottom: 10}}>Ajuster luminosité</Text>
    <Slider
      style={{width: '100%', height: 40}}
      minimumValue={0}
      maximumValue={100}
      step={5}
      value={currentIntensity}
      onValueChange={handleIntensityChange}
      minimumTrackTintColor="#E60000" 
      thumbTintColor="#E60000"
    />
    <Text>Luminosité: {currentIntensity} kW</Text>
  </View>
</Modal>
    </ScrollView>
    
  );
  
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor:"#fff"
  },
  verticalScroll:{
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#E60000',
  },
  scrollView: {
    marginBottom: 20,
  },
  boxContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  box: {
    width: 130,
    height: 130,
    backgroundColor: '#E4E6EA',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    position: 'relative',
  },
  
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#E60000',
    borderRadius: 10,
    top: 7,
    right: 10,
  },
  
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },  
  icon: {
    width: 30,
    height: 30,
    position: 'absolute',
    left: 5,
  },
  switch: {
    alignSelf: "flex-end",
  },
  energyText: {
    position: 'absolute',
    top: 52, 
    left: 10,
    right: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'red'
  },
  label: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000'
  },
  separator: {
    height: 2,
    backgroundColor: '#E60000', 
    marginVertical: 10,
    marginTop: -5
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  slider: {
    width: 300,
    height: 40,
  },
  intensityText: {
    marginTop: 12,
  },
});

export default LampeScreen;