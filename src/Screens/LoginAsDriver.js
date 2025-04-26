import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginAsDriver = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (text) => {
    setPhoneNumber(text);
    setPhoneError(
      text.match(/^\d{11}$/) ? "" : "Phone number must be 11 digits"
    );
  };

  const validatePassword = (text) => {
    setPassword(text);
    setPasswordError(
      text.length >= 6 ? "" : "Password must be at least 6 characters"
    );
  };

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (phoneError || passwordError) {
      Alert.alert("Error", "Please fix the errors before proceeding.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.100.61:3000/api/driver/login",
        {
          phoneNumber,
          password,
        }
      );
      // Store user name and role in AsyncStorage
      if (response.data && response.data.driver) {
        await AsyncStorage.setItem(
          "userName",
          response.data.driver.firstName + " " + response.data.driver.lastName
        );
        await AsyncStorage.setItem("userRole", "driver");
      }
      Alert.alert("Success", "Logged in successfully!", [
        {
          text: "Continue",
          onPress: () => navigation.navigate("DriverScreen"), // Update to your screen
        },
      ]);
    } catch (error) {
      console.log("Login Error:", error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Image source={require("../../assets/carr.jpg")} style={styles.image} />
        <Text style={styles.title}>Roam Together</Text>
        <Text style={styles.subtitle}>Driver Login</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={validatePhone}
          keyboardType="phone-pad"
          maxLength={11}
        />
        {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={validatePassword}
        />
        {passwordError ? (
          <Text style={styles.error}>{passwordError}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("SignUpStep1")}
          disabled={isLoading}
        >
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          disabled={isLoading}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#57A9FF" },
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
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
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
  disabledButton: { backgroundColor: "#A0C4FF" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  signupText: {
    textAlign: "center",
    marginTop: 15,
    color: "#007AFF",
    fontSize: 16,
  },
  forgotText: {
    textAlign: "center",
    marginTop: 10,
    color: "#FF3B30",
    fontSize: 14,
  },
});

export default LoginAsDriver;
