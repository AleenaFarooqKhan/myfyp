import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const SignUpStep1 = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    dob: false,
    profilePicture: false,
  });
  const [profilePicture, setprofilePicture] = useState(null);


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera permissions in settings to take profile pictures."
        );
      }
    })();
  }, []);

  // Capture Image Using Camera
  const captureImage = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setprofilePicture(result.assets[0].uri);
        setErrors((prev) => ({ ...prev, profilePicture: false }));
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  // Validate DOB Format (DD/MM/YYYY)
  const isValidDOB = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;

    const [day, month, year] = date.split("/").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  // Auto-format DOB Input
  const handleDobChange = (text) => {
    let formattedText = text.replace(/[^0-9]/g, ""); // Remove non-numeric characters

    if (formattedText.length > 2) formattedText = `${formattedText.slice(0, 2)}/${formattedText.slice(2)}`;
    if (formattedText.length > 5) formattedText = `${formattedText.slice(0, 5)}/${formattedText.slice(5, 9)}`;

    setDob(formattedText);
    setErrors((prev) => ({ ...prev, dob: false }));
  };

  // Handle Next Button
  const handleNext = () => {
    const newErrors = {
      firstName: !firstName.trim(),
      lastName: !lastName.trim(),
      dob: !isValidDOB(dob),
      profilePicture: !profilePicture,
    };
    setErrors(newErrors);

    if (newErrors.firstName) {
      Alert.alert("First Name Required", "Please enter your first name.");
      return;
    }
    if (newErrors.lastName) {
      Alert.alert("Last Name Required", "Please enter your last name.");
      return;
    }
    if (newErrors.dob) {
      Alert.alert(
        "Invalid Date",
        "Please enter a valid date of birth in DD/MM/YYYY format."
      );
      return;
    }
    if (newErrors.profilePicture) {
      Alert.alert(
        "Profile Picture Required",
        "Please take a profile picture before proceeding."
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("SignUpStep2", {
        step1Data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob,
          profilePicture,
        },
      });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Driver Sign Up</Text>
        <Text style={styles.subtitle}>Personal Information</Text>
      </View>

      {/* Profile Picture */}
      <TouchableOpacity
        style={[
          styles.imageContainer,
          errors.profilePicture && styles.imageContainerError,
        ]}
        onPress={captureImage}
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={40} color="white" />
            <Text style={styles.imageText}>Add Photo</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Input Fields */}
      <TextInput
        style={[styles.input, errors.firstName && styles.inputError]}
        placeholder="First Name"
        placeholderTextColor="#A9A9A9"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
          setErrors((prev) => ({ ...prev, firstName: false }));
        }}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, errors.lastName && styles.inputError]}
        placeholder="Last Name"
        placeholderTextColor="#A9A9A9"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
          setErrors((prev) => ({ ...prev, lastName: false }));
        }}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, errors.dob && styles.inputError]}
        placeholder="Date of Birth (DD/MM/YYYY)"
        placeholderTextColor="#A9A9A9"
        value={dob}
        onChangeText={handleDobChange}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={10}
      />

      {loading && <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />}
       
      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <Ionicons name="chevron-forward" size={22} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
    
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#78A7F2",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#A0C0F0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  imageContainerError: {
    borderColor: "red",
    borderWidth: 2,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  nextButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#A9D1FF",
    marginHorizontal: 10,
    borderRadius: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 5,
  },
});

export default SignUpStep1;
