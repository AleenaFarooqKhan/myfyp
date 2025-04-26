// navigation/MainNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DestinationScreen from '../src/Screens/DestinationScreen'; // Update if path is different

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Destination" component={DestinationScreen} />
    </Stack.Navigator>
  );
}
