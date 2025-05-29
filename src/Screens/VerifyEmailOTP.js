import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

const VerifyEmailOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {}; // fallback if email not passed

  const handleVerify = async () => {
    if (!otp.trim()) {
      return Alert.alert("Error", "Please enter the OTP");
    }

    // Debug log
    console.log("SENDING TO BACKEND ===>", { email, otp: otp.trim() });

    try {
      setIsLoading(true);

      const res = await axios.post("http://192.168.100.168:3000/api/passenger/verify-otp", {
        email,
        otp: Number(otp.trim()), // convert to number if backend stores as numeric
      });

      setIsLoading(false);
      console.log("BACKEND RESPONSE ===>", res.data);

      if (res.data && res.data.success === true) {
        Alert.alert("Success", "Your account has been verified!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("LoginAsPassenger"),
          },
        ]);
      } else {
        Alert.alert("Invalid OTP", res.data?.message || "Please try again");
      }
    } catch (err) {
      setIsLoading(false);
      console.log("VERIFICATION ERROR ===>", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to your email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VerifyEmailOTP;

