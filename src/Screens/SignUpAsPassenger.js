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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const SignUpAsPassenger = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const validatePhone = (text) => {
    setPhoneNumber(text);
    setPhoneError(!text.match(/^\d{11}$/) ? "Phone number must be 11 digits" : "");
  };

  const validatePassword = (text) => {
    setPassword(text);
    setPasswordError(text.length < 6 ? "Password must be at least 6 characters" : "");
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    if (phoneError || passwordError) {
      return Alert.alert("Error", "Please fix the errors before submitting");
    }

    try {
      setIsLoading(true);
      await axios.post("${API_BASE_URL}/api/passenger/register", {
        username,
        email,
        phoneNumber,
        password,
      });

      // Navigate to OTP verification screen with email
      navigation.navigate("VerifyEmailOTP", { email });

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Sign Up Failed", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.top}>
        <Image
          source={require("../../assets/carr.jpg")}
          style={styles.image}
        />
        <Text style={styles.title}>Roam Together</Text>
        <Text style={styles.subtitle}>Passenger SignUp</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
  style={styles.input}
  placeholder="Email"
  placeholderTextColor="#888"
  value={email}
  onChangeText={validateEmail}
/>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={validatePhone}
          keyboardType="phone-pad"
        />
        {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={validatePassword}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Link to Login Screen if user already has an account */}
        <TouchableOpacity onPress={() => navigation.navigate("LoginAsPassenger")}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#57A9FF",
  },
  top: {
    flex: 0.35,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  form: {
    flex: 0.65,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  image: {
    width: 170,
    height: 100,
    resizeMode: "contain",
    borderRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 2,
  },
  input: {
    width: "92%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 16,
    marginVertical: 8,
    fontSize: 16,
    elevation: 1,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    justifyContent: "center",
    borderRadius: 25,
    width: "92%",
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  error: {
    color: "red",
    fontSize: 13,
    alignSelf: "flex-start",
    paddingLeft: 25,
    marginTop: -4,
  },
  linkText: {
    marginTop: 12,
    fontSize: 15,
    color: "#007AFF",
  },
});

export default SignUpAsPassenger;
