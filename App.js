import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LocationProviders } from "./src/Context/Context";
import { StripeProvider } from "@stripe/stripe-react-native";

// Import your screens including role-specific ones
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
import ResetPasswordForDriver from "./src/Screens/ResetPasswordForDriver";
import ResetPasswordForPassenger from "./src/Screens/ResetPasswordForPassenger";
import RequestScreen from "./src/Screens/RequestScreen";
import DestinationScreen from "./src/Screens/DestinationScreen";
import DriverScreen from "./src/Screens/DriverScreen";
import OfferingCarpool from "./src/Screens/OfferingCarpool";
import ReservingCarpool from "./src/Screens/ReservingCarpool";
import AvailableCarpoolsScreen from "./src/Screens/AvailableCarpoolsScreen";
import BookingConfirmation from "./src/Screens/BookingConfirmation";
import SettingsDriver from "./src/Screens/SettingsDriver";
import SettingsPassenger from "./src/Screens/SettingsPassenger";
import DriverHelp from "./src/Screens/DriverHelp";
import HelpPassenger from "./src/Screens/HelpPassenger";
import SafetyDriver from "./src/Screens/SafetyDriver";
import SafetyPassenger from "./src/Screens/SafetyPassenger";
import DriverNotifications from "./src/Screens/DriverNotifications";
import NotificationsPassenger from "./src/Screens/NotificationsPassenger";
import MessagesDriver from "./src/Screens/MessagesDriver";
import MessagesPassenger from "./src/Screens/MessagesPassenger";
import PassengerProfile from "./src/Screens/PassengerProfile";
import DriverProfile from "./src/Screens/DriverProfile";
import VerifyEmailOTP from "./src/Screens/VerifyEmailOTP";



const Stack = createStackNavigator();
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
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="OfferingCarpool" component={OfferingCarpool} />
            <Stack.Screen name="AvailableCarpools" component={AvailableCarpoolsScreen} />
            <Stack.Screen name="ReservingCarpool" component={ReservingCarpool} />

            {/* Role-specific Profile Screens */}
            <Stack.Screen name="PassengerProfile" component={PassengerProfile} />
            <Stack.Screen name="DriverProfile" component={DriverProfile} />

            {/* Role-specific Messages */}
            <Stack.Screen name="MessagesDriver" component={MessagesDriver} />
            <Stack.Screen name="MessagesPassenger" component={MessagesPassenger} />

            {/* Role-specific Notifications */}
            <Stack.Screen name="DriverNotifications" component={DriverNotifications} />
            <Stack.Screen name="NotificationsPassenger" component={NotificationsPassenger} />

            {/* Role-specific Safety */}
            <Stack.Screen name="SafetyDriver" component={SafetyDriver} />
            <Stack.Screen name="SafetyPassenger" component={SafetyPassenger} />

            {/* Role-specific Settings */}
            <Stack.Screen name="SettingsDriver" component={SettingsDriver} />
            <Stack.Screen name="SettingsPassenger" component={SettingsPassenger} />

            {/* Role-specific Help */}
            <Stack.Screen name="DriverHelp" component={DriverHelp} />
            <Stack.Screen name="HelpPassenger" component={HelpPassenger} />

            {/* Password Reset */}
            <Stack.Screen name="ResetPasswordForDriver" component={ResetPasswordForDriver} />
            <Stack.Screen name="ResetPasswordForPassenger" component={ResetPasswordForPassenger} />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </LocationProviders>
  );
}
