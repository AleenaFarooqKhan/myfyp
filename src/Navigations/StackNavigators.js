import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../Screens/HomeScreen'; // correct path if your HomeScreen.js is inside 'screens' folder
import RequestScreen from '../Screens/RequestScreen'; // you should have a RequestScreen.js
// import OfferScreen if you have one

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="RequestScreen" 
        component={RequestScreen} 
        options={{ headerShown: false }} 
      />
      {/* Add other screens here like OfferScreen if you have */}
    </Stack.Navigator>
  );
};

export default StackNavigator;
