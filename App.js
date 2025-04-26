import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LocationProviders } from "./src/Context/Context";
import StackNavigator from "./src/Navigations/StackNavigators"; // correct path
import "react-native-get-random-values";

// Import all screens
import SplashScreen from "./src/Screens/SplashScreen";
import ProfileSetUpScreen from "./src/Screens/ProfileSetUpScreen";
import LoginAsDriver from "./src/Screens/LoginAsDriver";
import LoginAsPassenger from "./src/Screens/LoginAsPassenger";
import SignUpAsPassenger from "./src/Screens/SignUpAsPassenger";
import SignUpStep1 from "./src/Screens/SignUpStep1";
import SignUpStep2 from "./src/Screens/SignUpStep2";
import SignUpStep3 from "./src/Screens/SignUpStep3";
import HomeScreen from "./src/Screens/HomeScreen";
import RequestScreen from "./src/Screens/RequestScreen";
import DestinationScreen from "./src/Screens/DestinationScreen";
import DriverScreen from "./src/Screens/DriverScreen";
import OfferingCarpool from "./src/Screens/OfferingCarpool";
import ReservingCarpool from "./src/Screens/ReservingCarpool";

const Stack = createStackNavigator();

export default function App() {
  return (
    <LocationProviders>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen
            name="ProfileSetUpScreen"
            component={ProfileSetUpScreen}
          />
          <Stack.Screen name="LoginAsDriver" component={LoginAsDriver} />
          <Stack.Screen name="LoginAsPassenger" component={LoginAsPassenger} />
          <Stack.Screen
            name="SignUpAsPassenger"
            component={SignUpAsPassenger}
          />
          <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
          <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
          <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="RequestScreen" component={RequestScreen} />
          <Stack.Screen
            name="DestinationScreen"
            component={DestinationScreen}
          />
          <Stack.Screen name="DriverScreen" component={DriverScreen} />
          <Stack.Screen name="OfferingCarpool" component={OfferingCarpool} />
          <Stack.Screen name="ReservingCarpool" component={ReservingCarpool} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProviders>
  );
}
