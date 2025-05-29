

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity
// } from "react-native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";

// const OfferingCarpool = () => {
//   const [formData, setFormData] = useState({
//     startLocation: "",
//     endLocation: "",
//     date: "",
//     time: "",
//     seatsAvailable: "",
//     farePerSeat: "",
//     viaRoute: "",
//   });

//   const [driverInfo, setDriverInfo] = useState({
//     id: "",
//     name: "",
//     phoneNumber: ""
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const navigation = useNavigation();

//   useEffect(() => {
//     const fetchDriverDetails = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         // Get all stored driver info at once
//         const [phoneNumber, storedId, storedName] = await Promise.all([
//           AsyncStorage.getItem("phoneNumber"),
//           AsyncStorage.getItem("driverId"),
//           AsyncStorage.getItem("userName")
//         ]);

//         if (!phoneNumber || !storedId || !storedName) {
//           throw new Error("Driver session expired. Please login again.");
//         }

//         // Verify with backend
//         const response = await axios.get(
//           `http://192.168.1.9:3000/api/driver/findByPhoneNumber/${phoneNumber}`,
//           {
//             headers: {
//               Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`
//             }
//           }
//         );

//         if (!response.data?.success) {
//           throw new Error("Could not verify driver information");
//         }

//         setDriverInfo({
//           id: storedId,
//           name: storedName,
//           phoneNumber
//         });
//       } catch (err) {
//         console.error("Driver fetch error:", err);
//         setError(err.message);
//         Alert.alert(
//           "Session Error",
//           err.message,
//           [{ text: "OK", onPress: () => navigation.navigate("LoginAsDriver") }]
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDriverDetails();
//   }, [navigation]);

//   const handleChange = (name, value) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.startLocation || !formData.endLocation) {
//       Alert.alert("Error", "Please enter pickup and dropoff locations");
//       return false;
//     }
//     if (!formData.date || !formData.time) {
//       Alert.alert("Error", "Please select date and time");
//       return false;
//     }
//     if (!formData.seatsAvailable || isNaN(formData.seatsAvailable)) {
//       Alert.alert("Error", "Please enter valid number of seats");
//       return false;
//     }
//     if (!formData.farePerSeat || isNaN(formData.farePerSeat)) {
//       Alert.alert("Error", "Please enter valid fare amount");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;
//     if (!driverInfo.id) {
//       Alert.alert("Error", "Driver information not available");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) throw new Error("Authentication required");

//       const departureDate = new Date(`${formData.date}T${formData.time}`);
//       if (isNaN(departureDate.getTime())) {
//         throw new Error("Invalid date/time combination");
//       }

//       const response = await axios.post(
//         "http://192.168.1.9:3000/api/carpool/create",
//         {
//           driverId: driverInfo.id,
//           driverName: driverInfo.name,
//           startLocation: formData.startLocation.trim(),
//           endLocation: formData.endLocation.trim(),
//           viaRoute: formData.viaRoute?.trim() || "",
//           seatsAvailable: parseInt(formData.seatsAvailable),
//           farePerSeat: parseFloat(formData.farePerSeat),
//           departureTime: departureDate.toISOString(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           }
//         }
//       );

//       if (response.data.success) {
//         Alert.alert(
//           "Success", 
//           "Ride created successfully!",
//           [{ text: "OK", onPress: () => navigation.navigate("DriverScreen") }]
//         );
//       } else {
//         throw new Error(response.data.message || "Ride creation failed");
//       }
//     } catch (err) {
//       console.error("Submission error:", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.message || err.message || "Failed to create ride"
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4f46e5" />
//         <Text style={styles.loadingText}>Loading driver information...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => {
//             setError(null);
//             setIsLoading(true);
//           }}
//         >
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Offer a Ride</Text>
//       <Text style={styles.driverInfo}>
//         Driver: {driverInfo.name} (Phone: {driverInfo.phoneNumber})
//       </Text>

//       <TextInput
//         placeholder="Pickup Location*"
//         value={formData.startLocation}
//         onChangeText={(text) => handleChange("startLocation", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Dropoff Location*"
//         value={formData.endLocation}
//         onChangeText={(text) => handleChange("endLocation", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Via Route (Optional)"
//         value={formData.viaRoute}
//         onChangeText={(text) => handleChange("viaRoute", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Date (YYYY-MM-DD)*"
//         value={formData.date}
//         onChangeText={(text) => handleChange("date", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Time (HH:MM)*"
//         value={formData.time}
//         onChangeText={(text) => handleChange("time", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Seats Available*"
//         keyboardType="numeric"
//         value={formData.seatsAvailable}
//         onChangeText={(text) => handleChange("seatsAvailable", text)}
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Fare per Seat (PKR)*"
//         keyboardType="numeric"
//         value={formData.farePerSeat}
//         onChangeText={(text) => handleChange("farePerSeat", text)}
//         style={styles.input}
//       />

//       <TouchableOpacity
//         style={[styles.submitButton, isSubmitting && styles.disabledButton]}
//         onPress={handleSubmit}
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.submitButtonText}>Offer Ride</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: "#f3f4f6",
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//     color: "#4f46e5",
//   },
//   driverInfo: {
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#555",
//     fontSize: 16
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 8,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     fontSize: 16
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 15,
//     color: "#666",
//     fontSize: 16
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 25
//   },
//   errorText: {
//     color: "#d32f2f",
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 20
//   },
//   retryButton: {
//     backgroundColor: "#4f46e5",
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 6
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "500"
//   },
//   submitButton: {
//     backgroundColor: "#4f46e5",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10
//   },
//   disabledButton: {
//     backgroundColor: "#a5b4fc"
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold"
//   }
// });

// export default OfferingCarpool; 

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { colors, parameters } from "../Global/Styles";
import { GOOGLE_MAPS_APIKEY } from "@env";
import { isPointInAbbottabad } from '../../server/src/utils/locationUtils';
import { API_BASE_URL } from "../config/api"; // Adjust the import path as needed

const OfferingCarpool = () => {
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    date: "",
    time: "",
    seatsAvailable: "",
    farePerKm: "20", // Default rate is 20 PKR per km
    viaRoute: "",
  });

  const [driverInfo, setDriverInfo] = useState({
    id: "",
    name: "",
    phoneNumber: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Map selection states
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viaPoints, setViaPoints] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    start: null,
    end: null,
    via: []
  });

  useEffect(() => {
    const fetchDriverDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [phoneNumber, storedId, storedName] = await Promise.all([
          AsyncStorage.getItem("phoneNumber"),
          AsyncStorage.getItem("driverId"),
          AsyncStorage.getItem("userName")
        ]);

        if (!phoneNumber || !storedId || !storedName) {
          throw new Error("Driver session expired. Please login again.");
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/driver/findByPhoneNumber/${phoneNumber}`
          ,
          {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`
            }
          }
        );

        if (!response.data?.success) {
          throw new Error("Could not verify driver information");
        }

        setDriverInfo({
          id: storedId,
          name: storedName,
          phoneNumber
        });

        // Get current location for map
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (err) {
        console.error("Driver fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverDetails();
  }, [navigation]);

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    
    // Check if location is within Abbottabad boundaries
    if (!isPointInAbbottabad(coords.latitude, coords.longitude)) {
      Alert.alert(
        "Location Error",
        "Selected location must be within Abbottabad region",
        [{ text: "OK" }]
      );
      return;
    }
    
    setSelectedLocation(coords);
  };

  const confirmLocation = async () => {
    if (!selectedLocation) return;

    try {
      // Check if location is within Abbottabad boundaries
      if (!isPointInAbbottabad(selectedLocation.latitude, selectedLocation.longitude)) {
        Alert.alert(
          "Location Error",
          "Selected location must be within Abbottabad region",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Reverse geocode to get address
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${selectedLocation.latitude},${selectedLocation.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      const address = data.results[0]?.formatted_address || "Selected location";

      if (currentField === 'viaRoute') {
        // Add to via points array
        const newViaPoints = [...viaPoints, address];
        setViaPoints(newViaPoints);
        setFormData(prev => ({
          ...prev,
          viaRoute: newViaPoints.join(', ')
        }));
        
        // Store via point coordinates
        const newViaCoords = [...selectedCoordinates.via, selectedLocation];
        setSelectedCoordinates(prev => ({
          ...prev,
          via: newViaCoords
        }));
      } else if (currentField === 'startLocation') {
        // Set start location
        setFormData(prev => ({
          ...prev,
          [currentField]: address
        }));
        
        // Store start coordinates
        setSelectedCoordinates(prev => ({
          ...prev,
          start: selectedLocation
        }));
      } else {
        // Set end location
        setFormData(prev => ({
          ...prev,
          [currentField]: address
        }));
        
        // Store end coordinates
        setSelectedCoordinates(prev => ({
          ...prev,
          end: selectedLocation
        }));
      }

      setMapModalVisible(false);
      setSelectedLocation(null);
    } catch (error) {
      Alert.alert("Error", "Could not get address for this location");
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.startLocation || !formData.endLocation) {
      Alert.alert("Error", "Please select pickup and dropoff locations");
      return false;
    }
    
    if (!selectedCoordinates.start || !selectedCoordinates.end) {
      Alert.alert("Error", "Please select pickup and dropoff locations on the map");
      return false;
    }
    
    // Check if locations are within Abbottabad
    if (!isPointInAbbottabad(selectedCoordinates.start.latitude, selectedCoordinates.start.longitude) ||
        !isPointInAbbottabad(selectedCoordinates.end.latitude, selectedCoordinates.end.longitude)) {
      Alert.alert("Error", "Both pickup and dropoff locations must be within Abbottabad region");
      return false;
    }
    
    if (!formData.date || !formData.time) {
      Alert.alert("Error", "Please select date and time");
      return false;
    }
    if (!formData.seatsAvailable || isNaN(formData.seatsAvailable)) {
      Alert.alert("Error", "Please enter valid number of seats");
      return false;
    }
    if (!formData.farePerKm || isNaN(formData.farePerKm)) {
      Alert.alert("Error", "Please enter valid fare per kilometer");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      
      const departureDate = new Date(`${formData.date}T${formData.time}`);
      if (isNaN(departureDate.getTime())) {
        throw new Error("Invalid date/time combination");
      }
      
      const response = await axios.post(
         `${API_BASE_URL}/api/driver/login/api/carpool/create`,
        {
          driverId: driverInfo.id,
          driverName: driverInfo.name,
          startLocation: formData.startLocation.trim(),
          endLocation: formData.endLocation.trim(),
          viaRoute: formData.viaRoute?.trim() || "",
          startCoordinates: {
            latitude: selectedCoordinates.start.latitude,
            longitude: selectedCoordinates.start.longitude
          },
          endCoordinates: {
            latitude: selectedCoordinates.end.latitude,
            longitude: selectedCoordinates.end.longitude
          },
          viaCoordinates: selectedCoordinates.via,
          seatsAvailable: parseInt(formData.seatsAvailable),
          farePerKm: 20,
          farePerSeat: 20,
          departureTime: departureDate.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert(
          "Success", 
          "Ride created successfully!",
          [{ text: "OK", onPress: () => navigation.navigate("DriverScreen") }]
        );
      } else {
        throw new Error(response.data.message || "Ride creation failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to create ride"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Add this helper function to attempt session recovery
  const recoverSession = async () => {
    try {
      // Try to re-login silently using stored credentials
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const password = await AsyncStorage.getItem("password"); // If you store this (not recommended for security)
      
      if (!phoneNumber) return false;
      
      // If you don't store password, you'll need to prompt the user
      if (!password) {
        return false; // Can't recover automatically
      }
      
      // Attempt silent re-login
      const response = await axios.post(
       `${API_BASE_URL}/api/driver/login`,
        { phoneNumber, password }
      );
      
      if (response.data.token) {
        await AsyncStorage.setItem("authToken", response.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Session recovery failed:", error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.buttons} />
        <Text style={styles.loadingText}>Loading driver information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offer a Ride</Text>
      <Text style={styles.driverInfo}>
        Driver: {driverInfo.name} (Phone: {driverInfo.phoneNumber})
      </Text>

      {/* Start Location */}
      <TouchableOpacity 
        style={styles.locationInput}
        onPress={() => {
          setCurrentField('startLocation');
          setMapModalVisible(true);
        }}
      >
        <Text style={formData.startLocation ? styles.inputText : styles.placeholderText}>
          {formData.startLocation || "Pickup Location*"}
        </Text>
      </TouchableOpacity>

      {/* End Location */}
      <TouchableOpacity 
        style={styles.locationInput}
        onPress={() => {
          setCurrentField('endLocation');
          setMapModalVisible(true);
        }}
      >
        <Text style={formData.endLocation ? styles.inputText : styles.placeholderText}>
          {formData.endLocation || "Dropoff Location*"}
        </Text>
      </TouchableOpacity>

      {/* Via Route */}
      <View style={styles.viaRouteContainer}>
        <TouchableOpacity 
          style={[styles.locationInput, { flex: 1 }]}
          onPress={() => {
            setCurrentField('viaRoute');
            setMapModalVisible(true);
          }}
        >
          <Text style={formData.viaRoute ? styles.inputText : styles.placeholderText}>
            {formData.viaRoute || "Add Via Points (Optional)"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Display selected via points */}
      {viaPoints.length > 0 && (
        <View style={styles.viaPointsContainer}>
          {viaPoints.map((point, index) => (
            <View key={index} style={styles.viaPointItem}>
              <Text style={styles.viaPointText}>{point}</Text>
              <TouchableOpacity onPress={() => removeViaPoint(index)}>
                <Text style={styles.removeViaPoint}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TextInput
        placeholder="Date (YYYY-MM-DD)*"
        value={formData.date}
        onChangeText={(text) => handleChange("date", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Time (HH:MM)*"
        value={formData.time}
        onChangeText={(text) => handleChange("time", text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Seats Available*"
        keyboardType="numeric"
        value={formData.seatsAvailable}
        onChangeText={(text) => handleChange("seatsAvailable", text)}
        style={styles.input}
      />
<TextInput
  placeholder="Fare per Kilometer (PKR)*"
  keyboardType="numeric"
  value={formData.farePerKm}  // ✅ Use farePerKm to match state
  onChangeText={(text) => handleChange("farePerKm", text)}  // ✅ Update farePerKm
  style={styles.input}
/>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text   style={styles.submitButtonText} KeyboardShouldPersistTaps >Offer Ride</Text>
        )}
      </TouchableOpacity>

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.mapContainer}>
          {currentLocation && (
            <MapView
              style={styles.map}
              initialRegion={currentLocation}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker coordinate={selectedLocation} />
              )}
            </MapView>
          )}
          
          <View style={styles.mapButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setMapModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmLocation}
              disabled={!selectedLocation}
            >
              <Text style={styles.buttonText}>
                {currentField === 'viaRoute' ? 'Add Point' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.pagebackground,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.buttons,
  },
  driverInfo: {
    textAlign: "center",
    marginBottom: 20,
    color: colors.grey1,
    fontSize: 16
  },
  input: {
    backgroundColor: colors.cardbackground,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: colors.grey3,
    borderWidth: 1,
    fontSize: 16
  },
  locationInput: {
    backgroundColor: colors.cardbackground,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: colors.grey3,
    borderWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  inputText: {
    fontSize: 16,
    color: colors.black
  },
  placeholderText: {
    fontSize: 16,
    color: colors.grey
  },
  viaRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  viaPointsContainer: {
    marginBottom: 15,
  },
  viaPointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.cardbackground,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: colors.grey4
  },
  viaPointText: {
    flex: 1,
    fontSize: 14,
    color: colors.grey1
  },
  removeViaPoint: {
    color: colors.grey2,
    fontSize: 18,
    paddingHorizontal: 5
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: colors.grey2,
    fontSize: 16
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25
  },
  errorText: {
    color: colors.grey1,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6
  },
  retryButtonText: {
    color: colors.heaherText,
    fontSize: 16,
    fontWeight: "500"
  },
  submitButton: {
    backgroundColor: colors.buttons,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: colors.grey4
  },
  submitButtonText: {
    color: colors.heaherText,
    fontSize: 18,
    fontWeight: "bold"
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.grey7
  },
  cancelButton: {
    backgroundColor: colors.grey1,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  confirmButton: {
    backgroundColor: colors.buttons,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: colors.heaherText,
    fontWeight: 'bold'
  }
});

export default OfferingCarpool;




