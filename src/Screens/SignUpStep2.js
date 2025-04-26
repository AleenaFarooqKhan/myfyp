import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function SignUpStep2() {
  const navigation = useNavigation();
  const route = useRoute();
  const step1Data = route.params?.step1Data || {}; // Add fallback to avoid undefined

  const [vehicleModel, setVehicleModel] = useState("");
  const [licenseNumber, setlicenseNumber] = useState("");
  const [vehicleFrontPicture, setvehicleFrontPicture] = useState(null);
  const [licenseCertificatePicture, setlicenseCertificatePicture] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const captureImage = async (setImage, field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera permission is needed to take photos");
        return;
      }
 
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        setErrors((prev) => ({ ...prev, [field]: false }));
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const handleNext = () => {
    const newErrors = {
      vehicleModel: !vehicleModel.trim(),
      licenseNumber: !licenseNumber.trim(),
      vehicleFrontPicture: !vehicleFrontPicture,
      licenseCertificatePicture: !licenseCertificatePicture,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      Alert.alert("Incomplete Details", "Please complete all fields before proceeding.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.navigate("SignUpStep3", {
        step1Data,
        step2Data: {
          vehicleModel: vehicleModel.trim(),
          licenseNumber: licenseNumber.trim(),
          vehicleFrontPicture,
          licenseCertificatePicture,
        },
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Vehicle Information</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Model</Text>
        <TextInput
          style={[styles.input, errors.vehicleModel && styles.inputError]}
          placeholder="Enter vehicle model"
          placeholderTextColor="#A9A9A9"
          value={vehicleModel}
          onChangeText={(text) => {
            setVehicleModel(text);
            setErrors((prev) => ({ ...prev, vehicleModel: false }));
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>License Plate</Text>
        <TextInput
          style={[styles.input, errors.licenseNumber && styles.inputError]}
          placeholder="Enter license plate number"
          placeholderTextColor="#A9A9A9"
          value={licenseNumber}
          onChangeText={(text) => {
            setlicenseNumber(text);
            setErrors((prev) => ({ ...prev, licenseNumber: false }));
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Front View</Text>
        <TouchableOpacity
          style={[styles.scanButton, errors.vehicleFrontPicture && styles.scanButtonError]}
          onPress={() => captureImage(setvehicleFrontPicture, "vehicleFrontPicture")}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={24} color="#6DA8F6" />
          <Text style={styles.scanText}>Tap to Capture</Text>
        </TouchableOpacity>
        {vehicleFrontPicture && (
          <Image source={{ uri: vehicleFrontPicture }} style={styles.thumbnail} resizeMode="contain" />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Certificate of Vehicle License</Text>
        <TouchableOpacity
          style={[styles.scanButton, errors.licenseCertificatePicture && styles.scanButtonError]}
          onPress={() => captureImage(setlicenseCertificatePicture, "licenseCertificatePicture")}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={24} color="#6DA8F6" />
          <Text style={styles.scanText}>Tap to Capture</Text>
        </TouchableOpacity>
        {licenseCertificatePicture && (
          <Image source={{ uri: licenseCertificatePicture }} style={styles.thumbnail} resizeMode="contain" />
        )}
      </View>

      <View style={styles.bottomNav}>
        <Text style={styles.stepText}>Step 2 of 3</Text>
        <View style={styles.progressBar}>
          <View style={styles.progress} />
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6DA8F6",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "white",
  },
  input: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderWidth: 2,
    borderColor: "red",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  scanButtonError: {
    borderWidth: 2,
    borderColor: "red",
  },
  scanText: {
    fontSize: 16,
    color: "#6DA8F6",
    marginLeft: 10,
  },
  thumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: "#f0f0f0",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#A9D1FF",
    marginHorizontal: 10,
    borderRadius: 5,
  },
  progress: {
    width: "66%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 5,
  },
  nextButton: {
    backgroundColor: "#4A90E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginRight: 5,
  },
  stepText: {
    color: "white",
    fontWeight: "bold",
  },
});
