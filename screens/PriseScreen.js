import React, { useState, useEffect } from 'react';
import { View, Switch, Text, ScrollView, StyleSheet, Image } from 'react-native';
import firebase from 'firebase/compat';
import { db } from '../config';
import { ref, onValue, update } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PriseScreen = () => {
  const [prise_1, setPriseState_1] = useState(false);
  const [priseState_2, setPriseState_2] = useState(false);
  const [courant, setCourant] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [fridgeEnergy, setFridgeEnergy] = useState("");
  const [tvEnergy, setTvEnergy] = useState("");

  useEffect(() => {
    const courantRef = ref(db, 'PriseState/Etat_Courant');
    onValue(courantRef, (snapshot) => { 
      const etatCourant = snapshot.val();
      setCourant(etatCourant);
    });

    const priseStateRef = ref(db, 'PriseState');
      onValue(priseStateRef, (snapshot) => {
      const data = snapshot.val();
      setPriseState_1(data.prise_1 || false);
      setPriseState_2(data.prise_2 || false);
      setFridgeEnergy(`${data.Refrigerateur_energy || 0} kW`);
      setTvEnergy(`${data.Television_energy || 0} kW`);
    });
    
  }, []);

  const togglePriseState = (num, currentState) => {
    if (!courant) return;
    const newState = !currentState;

    update(ref(db,'PriseState'), {
      [`prise_${num}`]: newState,
    });
  };

  const iconPaths = {
    fridge: require('../assets/icons/fridge.png'),
    television: require('../assets/icons/television.png'),
    airConditioning: require('../assets/icons/air-conditioning.png'),
    computer: require('../assets/icons/computer.png'),
    fan: require('../assets/icons/fan.png'),
    coffee_machine: require('../assets/icons/coffee-machine.png'),
    freezer: require('../assets/icons/freezer.png'),
    iron: require('../assets/icons/iron.png'),
    microwave: require('../assets/icons/microwave.png'),
    oven: require('../assets/icons/oven.png'),
    printer: require('../assets/icons/printer.png'),
    chauffe_eau: require('../assets/icons/water-heater.png')
  };
  
  const renderBox = (imageName, isSwitchEnabled, switchValue, num, label,energy) => {
    const iconSource = iconPaths[imageName] || require('../assets/icons/television.png'); 
    return (
      <View style={styles.box}>
        <Image
          source={iconSource}
          style={styles.icon}
        />
        <Text style={styles.energyText}>{energy}</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#E60000" }}
          thumbColor={isEnabled ? "gray" : "#f4f3f4"} 
          ios_backgroundColor="gray"
          value={switchValue}
          onValueChange={() => togglePriseState(num, switchValue)}
          disabled={!courant || !isSwitchEnabled}
          style={styles.switch}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
    );
  };
  

  return (
    <ScrollView style={styles.verticalScroll}>
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>Salon</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("fridge", true, prise_1, 1, "Réfrigérateur", fridgeEnergy)}
        {renderBox("television", true, priseState_2, 2, "Télévision", tvEnergy)}
        {renderBox("airConditioning", false, false, null, "Climatiseur", "-")}
        {renderBox("computer", false, false, null, "Ordinateur", "-")}
        {renderBox("fan", false, false, null, "Ventilateur", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <Text style={styles.categoryTitle}>Chambre</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("airConditioning", false, false, null, "Climatiseur", "-")}
        {renderBox("television", false, false, null, "Télévision", "-")}
        {renderBox("fan", false, false, null, "Ventilateur", "-")}
        {renderBox("computer", false, false, null, "Ordinateur", "-")}
        {renderBox("printer", false, false, null, "Imprimante", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <Text style={styles.categoryTitle}>Cuisine</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("oven", false, false, null, "Four", "-")}
        {renderBox("microwave", false, false, null, "Micro-onde", "-")}
        {renderBox("freezer", false, false, null, "Congelateur", "-")}
        {renderBox("coffee_machine", false, false, null, "Cafetière", "-")}
      </ScrollView>
      <View style={styles.separator} />
      <Text style={styles.categoryTitle}>Salle de bain</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {renderBox("chauffe_eau", false, false, null, "Chambre 1", "-")}
      </ScrollView>
    </View>
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
  box: {
    width: 130,
    height: 130,
    backgroundColor: '#E4E6EA',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
    position: 'relative',
  },
  icon: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  switch: {
    alignSelf: "flex-end",
  },
  energyText: {
    position: 'absolute',
    top: 60,
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
  },
});

export default PriseScreen;
