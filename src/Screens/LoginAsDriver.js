import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";
import { API_BASE_URL } from "../../src/config/api"; // adjust path if needed

const LoginAsDriver = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      console.log("Sending login request for:", phoneNumber);

      const response = await axios.post(`${API_BASE_URL}/api/driver/login`, {
        phoneNumber,
        password,
      });


      if (
        response.data.driver &&
        response.data.message === "Driver Logged In"
      ) {
        const driver = response.data.driver;
        console.log("driverId", driver._id);
        await Promise.all([
          AsyncStorage.setItem("driverId", driver._id),
          AsyncStorage.setItem("phoneNumber", driver.phoneNumber),
          AsyncStorage.setItem(
            "userName",
            `${driver.firstName} ${driver.lastName}`
          ),
          AsyncStorage.setItem("userRole", "driver"),
        ]);

        Alert.alert("Success", "Logged in successfully!", [
          {
            text: "Continue",
            onPress: () => navigation.navigate("DriverScreen"),
          },
        ]);
      } else {
        Alert.alert(
          "Login Issue",
          "Unexpected response format. Please contact support."
        );
      }
    } catch (error) {
      console.error("Login Error Object:", error);

      if (error.response) {
        Alert.alert(
          "Login Failed",
          error.response.data?.message || "Server returned an error."
        );
      } else if (error.request) {
        Alert.alert(
          "Connection Error",
          "No response from server. Check your network connection."
        );
      } else {
        if (error.message === "Driver Logged In") {
          Alert.alert("Success", "Logged in successfully!", [
            {
              text: "Continue",
              onPress: () => navigation.navigate("DriverScreen"),
            },
          ]);
        } else {
          Alert.alert("Login Error", error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 1}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#57A9FF" }}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topContainer}>
          <StatusBar backgroundColor="#1E90FF" barStyle="light-content" />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/carr.jpg")}
            style={styles.image}
          />
          <Text style={styles.title}>Roam Together</Text>
          <Text style={styles.subtitle}>Driver Login</Text>
        </View>

        <View style={styles.formWrapper}>
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

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={validatePassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#888"
                  style={{ paddingHorizontal: 10 }}
                />
              </TouchableOpacity>
            </View>
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
              <Text style={styles.signupText}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={isLoading}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#57A9FF" },

  scrollContentContainer: {
    flexGrow: 1,
  },

  topContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#57A9FF",
  },

  backButton: {
    position: "absolute",
    top: 25,
    left: 1,
    zIndex: 10,
    padding: 5,
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

  formWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 20,
  },

  formContainer: {
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

  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "90%",
    marginVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#000",
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
