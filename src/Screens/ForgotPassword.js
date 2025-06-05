import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import API_BASE_URL from "../config/api";
import axios from "axios";

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // Step 1 = email, Step 2 = OTP
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `http://192.168.1.14:3000/api/driver/send-otp`,
        { email }
      );
      setLoading(false);
      Alert.alert(
        "Success",
        response.data.message || "OTP sent to your email."
      );
      setStep(2);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send OTP. !!"
      );
    }
  };

  const handleVerifyOTP = async () => {
    console.log("aaa");
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      console.log(email);
      const response = await axios.post(
        `http://192.168.1.14:3000/api/driver/verify-otp`,
        { email, otp }
      );

      setLoading(false);
      Alert.alert("Success", response.data.message || "OTP Verified");
      navigation.navigate("ResetPasswordForDriver", { email });
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Invalid OTP. Try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 ? (
        <>
          <Text style={styles.subtitle}>Enter your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to your email
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FAFF",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  input: {
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
