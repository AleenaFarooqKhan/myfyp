import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import Feather from "react-native-vector-icons/Feather";

const LoginAsPassenger = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const returnToBooking = route.params?.returnToBooking || false;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // <-- added state

  const validatePhone = (text) => {
    setPhoneNumber(text);
    if (!text.match(/^\d{11}$/)) {
      setPhoneError("Phone number must be 11 digits");
    } else {
      setPhoneError("");
    }
  };

  const validatePassword = (text) => {
    setPassword(text);
    if (text.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    console.log("Login button clicked");
    if (phoneError || passwordError || !phoneNumber || !password) {
      Alert.alert("Error", "Please fill all fields correctly");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/passenger/login`,
        {
          phoneNumber,
          password,
        }
      );
  
      console.log("Login response:", response.data);
  
      if (response.data && response.data.passenger) {
        const tempToken = `temp_${Date.now()}_${response.data.passenger._id}`;
        await AsyncStorage.setItem("authToken", tempToken);
        await AsyncStorage.setItem("userId", response.data.passenger._id);
        await AsyncStorage.setItem("userName", response.data.passenger.username);
        await AsyncStorage.setItem("userRole", "passenger");
        
        const pendingBooking = await AsyncStorage.getItem("pendingBooking");
        
        if (returnToBooking && pendingBooking) {
          const bookingData = JSON.parse(pendingBooking);
          await AsyncStorage.removeItem("pendingBooking");
          
          Alert.alert("Success", "Login successful! Returning to your booking.", [
            {
              text: "Continue",
              onPress: () => navigation.navigate("BookingConfirmation", bookingData),
            },
          ]);
        } else {
          Alert.alert("Success", "Logged in successfully!", [
            {
              text: "Continue",
              onPress: () => navigation.navigate("HomeScreen"),
            },
          ]);
        }
      } else {
        throw new Error("Invalid login response format");
      }
    } catch (error) {
      console.log("Login Error:", error);
      console.log("Login Error:", error.message);
      
      if (error.message === "Passenger logged in") {
        console.log("Detected successful login despite error format");
        
        const passengerId = error.response?.data?.passenger?._id || "unknown_id";
        const username = error.response?.data?.passenger?.username || "User";
        
        await AsyncStorage.setItem("authToken", `temp_${Date.now()}_${passengerId}`);
        await AsyncStorage.setItem("userId", passengerId);
        await AsyncStorage.setItem("userName", username);
        await AsyncStorage.setItem("userRole", "passenger");
        
        Alert.alert("Success", "Logged in successfully!", [
          {
            text: "Continue",
            onPress: () => navigation.navigate("HomeScreen"),
          },
        ]);
      } else {
        Alert.alert(
          "Login Failed",
          error.response?.data?.message || error.message || "Something went wrong."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust this if you have a header
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <StatusBar backgroundColor="#1E90FF" barStyle="light-content" />
          <View style={styles.topContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather
                  name="arrow-left"
                  size={28}
                  color="#fff"
                  style={{
                    position: "absolute",
                    top: -5,
                    left: 8,
                    zIndex: 10,
                  }}
                />
              </TouchableOpacity>
            </View>

            <Image source={require("../../assets/carr.jpg")} style={styles.image} />
            <Text style={styles.title}>Roam Together</Text>
            <Text style={styles.subtitle}>Passenger Login</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={validatePhone}
              keyboardType="phone-pad"
            />
            {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

            {/* Password container with eye icon */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!passwordVisible} // toggle secureTextEntry
                value={password}
                onChangeText={validatePassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={passwordVisible ? "eye" : "eye-off"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("SignUpAsPassenger")}>
              <Text style={styles.signupText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>

            {returnToBooking && (
              <TouchableOpacity
                style={styles.cancelBookingButton}
                onPress={() => {
                  AsyncStorage.removeItem("pendingBooking");
                  navigation.navigate("HomeScreen");
                }}
              >
                <Text style={styles.cancelBookingText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#57A9FF",
  },
  topContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#57A9FF",
  },
  image: {
    width: 250,
    height: 180,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginVertical: 5,
  },
  formContainer: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingTop: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 15,
    width: "90%",
    fontSize: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "90%",
    paddingHorizontal: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeIcon: {
    paddingHorizontal: 5,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 5,
    alignSelf: "flex-start",
    paddingLeft: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "90%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupText: {
    textAlign: "center",
    marginTop: 15,
    color: "#007AFF",
    fontSize: 16,
  },
  cancelBookingButton: {
    marginTop: 15,
  },
  cancelBookingText: {
    color: "red",
    fontSize: 16,
  },
});

export default LoginAsPassenger;
