import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

const PassengerProfile = () => {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (id) {
          setUserId(id);
          await fetchProfile(id);
        }
      } catch (error) {
        console.log("Error fetching userId:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
  }, []);

  const fetchProfile = async (id) => {
    try {
      console.log();
      const response = await axios.get(
        `${API_BASE_URL}/api/passenger/${id}/profile`
      );
      if (response.data && response.data.passenger) {
        setName(response.data.passenger.username || "");
        setEmail(response.data.passenger.email || "");
        setPhone(response.data.passenger.phoneNumber || "");
      }
    } catch (error) {
      console.log("Error fetching profile:", error.message);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_BASE_URL}/api/passenger/${userId}/update-profile`,
        {
          email,
          name,
          phone,
        }
      );
      if (response.data) {
        Alert.alert(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to update profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Edit Profile</Text>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#f2f4f8",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1c1c1c",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    marginTop: 24,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PassengerProfile;
