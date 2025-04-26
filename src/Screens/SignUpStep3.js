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
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

export default function SignUpStep3() {
  const navigation = useNavigation();
  const route = useRoute();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!password || !confirmPassword || !phoneNumber || !email) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!phoneNumber.match(/^\d{11}$/)) {
      setError("Phone number must be 11 digits.");
      return;
    }

    const step1Data = route?.params?.step1Data;
    const step2Data = route?.params?.step2Data;

    if (!step1Data || !step2Data) {
      Alert.alert("Error", "Missing signup data from previous steps.");
      return;
    }

    const userData = {
      ...step1Data,
      ...step2Data,
      phoneNumber,
      password,
      email,
    };

    const formData = new FormData();

    formData.append("firstName", userData.firstName);
    formData.append("lastName", userData.lastName);
    formData.append("dob", userData.dob);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("licenseNumber", userData.licenseNumber);
    formData.append("vehicleModel", userData.vehicleModel);

    if (
      userData.profilePicture &&
      userData.vehicleFrontPicture &&
      userData.licenseCertificatePicture
    ) {
      formData.append("profilePicture", {
        uri: userData.profilePicture,
        name: "profile.jpg",
        type: "image/jpeg",
      });
      formData.append("vehicleFrontPicture", {
        uri: userData.vehicleFrontPicture,
        name: "vehicleFront.jpg",
        type: "image/jpeg",
      });
      formData.append("licenseCertificatePicture", {
        uri: userData.licenseCertificatePicture,
        name: "license.jpg",
        type: "image/jpeg",
      });
    } else {
      Alert.alert("Image Error", "One or more images are missing.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://192.168.100.61:3000/api/driver/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.message) {
        Alert.alert("Success", response.data.message, [
          {
            text: "Continue",
            onPress: () => navigation.navigate("LoginAsDriver"),
          },
        ]);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        Alert.alert("Register Failed", error.response.data.message);
      } else {
        Alert.alert(
          "Register Failed",
          error.message || "An unknown error occurred."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Set Your Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A9A9A9"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#A9A9A9"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setError("");
        }}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setError("");
        }}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Text style={styles.finishButtonText}>Finish Signup</Text>
            <Ionicons name="checkmark-circle" size={22} color="white" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6DA8F6",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#E3F2FD",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: "#005BBB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginRight: 5,
  },
});
