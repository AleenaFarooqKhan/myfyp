import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LocationProviders } from "./src/Context/Context";
import { StripeProvider } from "@stripe/stripe-react-native";

// Import screens
import ResetPassword from "./src/Screens/ResetPassword";
import SplashScreen from "./src/Screens/SplashScreen";
import ProfileSetUpScreen from "./src/Screens/ProfileSetUpScreen";
import LoginAsDriver from "./src/Screens/LoginAsDriver";
import LoginAsPassenger from "./src/Screens/LoginAsPassenger";
import SignUpAsPassenger from "./src/Screens/SignUpAsPassenger";
import SignUpStep1 from "./src/Screens/SignUpStep1";
import SignUpStep2 from "./src/Screens/SignUpStep2";
import SignUpStep3 from "./src/Screens/SignUpStep3";
import HomeScreen from "./src/Screens/HomeScreen";
import ForgotPassword from "./src/Screens/ForgotPassword";
import RequestScreen from "./src/Screens/RequestScreen";
import DestinationScreen from "./src/Screens/DestinationScreen";
import DriverScreen from "./src/Screens/DriverScreen";
import OfferingCarpool from "./src/Screens/OfferingCarpool";
import ReservingCarpool from "./src/Screens/ReservingCarpool";
import AvailableCarpoolsScreen from "./src/Screens/AvailableCarpoolsScreen";
import BookingConfirmation from "./src/Screens/BookingConfirmation";
import Settings from "./src/Screens/Settings";
import Help from "./src/Screens/Help";
import Safety from "./src/Screens/Safety";
import Notifications from "./src/Screens/Notifications";
import Messages from "./src/Screens/Messages";
import ProfileScreen from "./src/Screens/ProfileScreen";
import VerifyEmailOTP from "./src/Screens/VerifyEmailOTP";

const Stack = createStackNavigator();

// Replace with your real Stripe key
const STRIPE_PUBLISHABLE_KEY = "pk_test_XXXXXXXXXXXXXXXXXXXXXXXX";

export default function App() {
  return (
    <LocationProviders>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="SplashScreen"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="ProfileSetUpScreen" component={ProfileSetUpScreen} />
            <Stack.Screen name="LoginAsDriver" component={LoginAsDriver} />
            <Stack.Screen name="LoginAsPassenger" component={LoginAsPassenger} />
            <Stack.Screen name="SignUpAsPassenger" component={SignUpAsPassenger} />
            <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
            <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
            <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="RequestScreen" component={RequestScreen} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmation} />
            <Stack.Screen name="DestinationScreen" component={DestinationScreen} />
            <Stack.Screen name="DriverScreen" component={DriverScreen} />
            <Stack.Screen name="VerifyEmailOTP" component={VerifyEmailOTP} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
            />
            <Stack.Screen name="OfferingCarpool" component={OfferingCarpool} />
            <Stack.Screen
              name="AvailableCarpools"
              component={AvailableCarpoolsScreen}
              options={{ title: "Available Carpools", headerBackTitle: "Back" }}
            />
            <Stack.Screen name="ReservingCarpool" component={ReservingCarpool} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Help" component={Help} />
            <Stack.Screen name="Safety" component={Safety} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Messages" component={Messages} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </LocationProviders>
  );
}
