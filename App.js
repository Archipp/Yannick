import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/Homescreen';
import PriseScreen from './screens/PriseScreen';
import LampeScreen from './screens/LampeScreen';
import SettingScreen from './screens/SettingScreen';
import CameraScreen from './screens/cameraScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Prises') {
            iconName = focused ? 'disc-outline' : 'disc-outline';
          } else if (route.name === 'Lampes') {
            iconName = focused ? 'bulb-outline' : 'bulb-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera-outline' : 'camera-outline';
          }
          else if (route.name === 'Paramètres') {
            iconName = focused ? 'settings' : 'settings';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        "tabBarActiveTintColor": "#E60000",
        "tabBarInactiveTintColor": "gray",
        "tabBarStyle": { "display": "flex"},

      })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} options={{ headerShown: false }}/>
        <Tab.Screen name="Prises" component={PriseScreen} />
        <Tab.Screen name="Lampes" component={LampeScreen} />
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Paramètres" component={SettingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
