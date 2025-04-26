import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginAsPassenger = () => {
  const navigation = useNavigation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        "http://192.168.100.9:3000/api/passenger/login",
        {
          phoneNumber,
          password,
        }
      );

      console.log("Login response:", response.data);

      // Store user name and role in AsyncStorage
      if (response.data && response.data.passenger) {
        await AsyncStorage.setItem(
          "userName",
          response.data.passenger.username
        );
        await AsyncStorage.setItem("userRole", "passenger");
      }

      Alert.alert("Success", "Logged in successfully!", [
        {
          text: "Continue",
          onPress: () => navigation.navigate("HomeScreen"),
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
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image
            source={require("../../assets/carr.jpg")}
            style={styles.image}
          />
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
            style={[styles.button, isLoading && { opacity: 0.6 }]}
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
            onPress={() => navigation.navigate("SignUpAsPassenger")}
          >
            <Text style={styles.signupText}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
});

export default LoginAsPassenger;
