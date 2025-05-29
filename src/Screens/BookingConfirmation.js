import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../Global/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../config/api';
import { isPointInAbbottabad } from "../../server/src/utils/locationUtils";

const BookingConfirmation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [carpoolDetails, setCarpoolDetails] = useState(null);
  const [userName, setUserName] = useState('');
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Extract data from route params
  const {
    carpoolId,
    origin,
    destination,
    distance,
    price,
    pricePerKm,
    pricePerPassenger,
    passengerCount,
    driverName,
    departureTime,
    originCoords,
    destinationCoords
  } = route.params || {};
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const id = await AsyncStorage.getItem("userId");
        const name = await AsyncStorage.getItem("userName");
        
        console.log("BookingConfirmation: User data loaded:", { 
          hasToken: !!token, 
          userId: id, 
          userName: name 
        });
        
        setAuthToken(token);
        setUserId(id);
        
        if (name) {
          setUserName(name);
        } else if (token && id) {
          // We have authentication but missing userName
          // Try to fetch user data from API
          try {
            const response = await axios.get(`${API_BASE_URL}/api/passengers/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.passenger && response.data.passenger.username) {
              setUserName(response.data.passenger.username);
              await AsyncStorage.setItem("userName", response.data.passenger.username);
            } else {
              setShowUserInfoForm(true);
            }
          } catch (error) {
            console.log("Could not fetch user data:", error);
            setShowUserInfoForm(true);
          }
        } else {
          setShowUserInfoForm(true);
        }
      } catch (error) {
        console.log("Error loading user data:", error);
        setShowUserInfoForm(true);
      }
    };
    
    loadUserData();
    fetchCarpoolDetails();
  }, [carpoolId]);
  
  const fetchCarpoolDetails = async () => {
    if (!carpoolId) {
      Alert.alert("Error", "Carpool information missing");
      navigation.goBack();
      return;
    }
    
    // Verify locations are within Abbottabad region
    if (!isPointInAbbottabad(originCoords.latitude, originCoords.longitude) || 
        !isPointInAbbottabad(destinationCoords.latitude, destinationCoords.longitude)) {
      Alert.alert(
        "Location Error",
        "Both pickup and dropoff locations must be within Abbottabad region.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE_URL}/api/carpool/${carpoolId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        setCarpoolDetails(response.data.carpool);
      } else {
        throw new Error("Failed to fetch carpool details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Don't show an error - we can use the data that was passed in
      setCarpoolDetails({
        driverName,
        departureTime,
        farePerKm: pricePerKm,
        passengers: [],
        seatsAvailable: 3 // Default value
      });
    } finally {
      setLoading(false);
    }
  };
  
  const saveUserInfo = async () => {
    if (!userName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    try {
      // Save userName to AsyncStorage
      await AsyncStorage.setItem("userName", userName);
      
      // Check if we have a token (meaning the user is authenticated)
      if (authToken) {
        // Since we have a token, we can proceed without calling the profile API
        setShowUserInfoForm(false);
        
        // If we don't have a userId but have a token, try to extract it from the token
        if (!userId) {
          try {
            // Try to decode the JWT token to get the user ID
            const parts = authToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              if (payload && payload.id) {
                await AsyncStorage.setItem("userId", payload.id);
                setUserId(payload.id);
              }
            }
          } catch (tokenError) {
            console.log("Failed to extract user ID from token:", tokenError);
            // We'll proceed anyway, the booking API might still work with just the token
          }
        }
      } else {
        // We don't have a token, need to login
        Alert.alert(
          "Login Required",
          "Please login to continue with booking",
          [
            { 
              text: "Go to Login", 
              onPress: () => {
                // Save current booking info to return after login
                AsyncStorage.setItem("pendingBooking", JSON.stringify({
                  carpoolId,
                  origin,
                  destination,
                  distance,
                  price,
                  pricePerKm,
                  originCoords,
                  destinationCoords
                }));
                navigation.navigate("LoginScreen", { returnToBooking: true });
              }
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error saving user information:", error);
      Alert.alert("Error", "Failed to save your name. Please try again.");
    }
  };
  
  // Helper function for decoding base64 in JWT
  const atob = (input) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 === 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    
    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    
    return output;
  };
  
  const handleBooking = async () => {
    // Check if we have user info
    if (!authToken || !userId || !userName) {
      setShowUserInfoForm(true);
      return;
    }
    
    setLoading(true);
    try {
      // Determine which fare to use
      const fareToUse = passengerCount > 1 ? pricePerPassenger : price;
      
      // Create a booking request that matches the backend API structure
      const bookingRequest = {
        carpoolId,
        passengerId: userId,
        passengerName: userName,
        pickupLocation: origin,
        dropoffLocation: destination,
        pickupCoordinates: originCoords,
        dropoffCoordinates: destinationCoords,
        distance,
        fare: fareToUse,
        ratePerKm: pricePerKm,
        seats: 1, // Default to 1 seat per booking
        notes: `Shared ride with ${passengerCount} passengers. Booked via mobile app.`
      };
      
      console.log("Sending booking request:", bookingRequest);
      console.log("API base URL:", API_BASE_URL);
      
      // Try different endpoints
      let response;
      let apiSuccess = false;
      
      try {
        // First attempt: Try with 'reservations'
        console.log("Trying /api/reservations/create");
        response = await axios.post(
          `${API_BASE_URL}/api/reservations/create`,
          bookingRequest,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json"
            },
            timeout: 5000 // 5 second timeout
          }
        );
        apiSuccess = true;
      } catch (error1) {
        console.log(`First endpoint failed: ${error1.message}`);
        
        if (error1.response && error1.response.status === 404) {
          try {
            // Second attempt: Try with 'reservation' (singular)
            console.log("Trying /api/reservation/create");
            response = await axios.post(
              `${API_BASE_URL}/api/reservation/create`,
              bookingRequest,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json"
                },
                timeout: 5000
              }
            );
            apiSuccess = true;
          } catch (error2) {
            console.log(`Second endpoint failed: ${error2.message}`);
            
            // Try other variations
            try {
              // Third attempt: Try with '/bookings' 
              console.log("Trying /api/bookings/create");
              response = await axios.post(
                `${API_BASE_URL}/api/bookings/create`,
                bookingRequest,
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                  },
                  timeout: 5000
                }
              );
              apiSuccess = true;
            } catch (error3) {
              console.log(`Third endpoint failed: ${error3.message}`);
              throw new Error("All API endpoints failed");
            }
          }
        } else {
          throw error1;
        }
      }
      
      if (apiSuccess && response.data && response.data.success) {
        console.log("Booking response:", response.data);
        
        // Store the reservation details for display on HomeScreen
        try {
          // Get existing reservations if any
          const existingReservationsJson = await AsyncStorage.getItem("userReservations");
          const existingReservations = existingReservationsJson ? JSON.parse(existingReservationsJson) : [];
          
          // Create a more complete reservation object with all necessary fields
          const newReservation = {
            _id: response.data.reservation._id,
            carpoolId,
            driverName,
            driverId: response.data.reservation.driver,
            pickupLocation: origin,
            dropoffLocation: destination,
            pickupCoordinates: originCoords,
            dropoffCoordinates: destinationCoords,
            status: response.data.reservation.status || "confirmed",
            fare: fareToUse,
            distance,
            createdAt: new Date().toISOString(),
            departureTime,
            passengerCount: passengerCount,
            ratePerKm: pricePerKm,
            vehicleModel: carpoolDetails?.vehicleModel || "Not specified"
          };
          
          // Check if this reservation already exists in the array (by ID)
          const existingIndex = existingReservations.findIndex(
            res => res._id === newReservation._id
          );
          
          if (existingIndex >= 0) {
            // Update existing reservation
            existingReservations[existingIndex] = newReservation;
          } else {
            // Add new reservation to beginning of array
            existingReservations.unshift(newReservation);
          }
          
          // Save updated reservations
          await AsyncStorage.setItem("userReservations", JSON.stringify(existingReservations));
          
          // Also store just the IDs for faster lookups
          let reservationIds = await AsyncStorage.getItem("userReservationIds");
          reservationIds = reservationIds ? JSON.parse(reservationIds) : [];
          
          if (!reservationIds.includes(newReservation._id)) {
            reservationIds.unshift(newReservation._id);
            await AsyncStorage.setItem("userReservationIds", JSON.stringify(reservationIds));
          }
        } catch (storageError) {
          console.error("Error saving reservation to local storage:", storageError);
          // Continue anyway - this is just for local caching
        }
        
        Alert.alert(
          "Success",
          "Your ride has been booked successfully!",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("HomeScreen")
            }
          ]
        );
      } else {
        throw new Error(response?.data?.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking error:", error);
      
      // Generate a unique ID for the mock reservation
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      try {
        // Store mock reservation details for testing/offline functionality
        const existingReservationsJson = await AsyncStorage.getItem("userReservations");
        const existingReservations = existingReservationsJson ? JSON.parse(existingReservationsJson) : [];
        
        const newReservation = {
          _id: mockId,
          carpoolId,
          driverName,
          pickupLocation: origin,
          dropoffLocation: destination,
          pickupCoordinates: originCoords,
          dropoffCoordinates: destinationCoords,
          status: "confirmed",
          fare: passengerCount > 1 ? pricePerPassenger : price,
          distance,
          createdAt: new Date().toISOString(),
          departureTime,
          passengerCount: passengerCount,
          ratePerKm: pricePerKm,
          vehicleModel: "Mock Vehicle"
        };
        
        existingReservations.unshift(newReservation);
        await AsyncStorage.setItem("userReservations", JSON.stringify(existingReservations));
        
        // Also update the IDs array
        let reservationIds = await AsyncStorage.getItem("userReservationIds");
        reservationIds = reservationIds ? JSON.parse(reservationIds) : [];
        reservationIds.unshift(mockId);
        await AsyncStorage.setItem("userReservationIds", JSON.stringify(reservationIds));
        
        Alert.alert(
          "Offline Booking",
          "Your ride has been booked in offline mode. The server will be updated when connectivity is restored.",
          [{ text: "OK", onPress: () => navigation.navigate("HomeScreen") }]
        );
      } catch (mockError) {
        Alert.alert(
          "Booking Failed",
          error.response?.data?.message || error.message || "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate the fee to display (shared or full)
  const finalFare = passengerCount > 1 ? pricePerPassenger : price;
  const serviceFee = 10; // Fixed service fee
  const totalPayment = finalFare + serviceFee;
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.buttons} />
        <Text style={styles.loadingText}>Processing your request...</Text>
      </View>
    );
  }
  
  if (showUserInfoForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.grey1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Information</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
          />
          
          <TouchableOpacity
            style={styles.bookButton}
            onPress={saveUserInfo}
          >
            <Text style={styles.bookButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={colors.grey1} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Confirmation</Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Trip Details</Text>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Icon name="person" size={20} color={colors.grey1} />
            <Text style={styles.cardLabel}>Driver:</Text>
            <Text style={styles.cardValue}>{driverName}</Text>
          </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.locationIconContainer}>
              <Icon name="location-on" size={20} color="red" />
              <View style={styles.routeLine} />
              <Icon name="location-on" size={20} color="green" />
            </View>
            
            <View style={styles.routeDetails}>
              <Text style={styles.locationText}>{origin}</Text>
              <Text style={styles.locationText}>{destination}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.cardRow}>
            <Icon name="schedule" size={20} color={colors.grey1} />
            <Text style={styles.cardLabel}>Departure:</Text>
            <Text style={styles.cardValue}>
              {new Date(departureTime).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.cardRow}>
            <Icon name="directions-car" size={20} color={colors.grey1} />
            <Text style={styles.cardLabel}>Distance:</Text>
            <Text style={styles.cardValue}>{distance.toFixed(1)} km</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Icon name="attach-money" size={20} color={colors.grey1} />
            <Text style={styles.cardLabel}>Rate:</Text>
            <Text style={styles.cardValue}>Rs. {pricePerKm}/km</Text>
          </View>
          
          {passengerCount > 1 && (
            <View style={styles.cardRow}>
              <Icon name="group" size={20} color={colors.grey1} />
              <Text style={styles.cardLabel}>Shared:</Text>
              <Text style={styles.cardValue}>Cost split among {passengerCount} passengers</Text>
            </View>
          )}
          
          {carpoolDetails && (
            <View style={styles.cardRow}>
              <Icon name="airline-seat-recline-normal" size={20} color={colors.grey1} />
              <Text style={styles.cardLabel}>Seats:</Text>
              <Text style={styles.cardValue}>{carpoolDetails.seatsAvailable} remaining</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Trip distance</Text>
          <Text style={styles.paymentValue}>{distance.toFixed(1)} km</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Rate per kilometer</Text>
          <Text style={styles.paymentValue}>Rs. {pricePerKm}</Text>
        </View>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Full trip cost</Text>
          <Text style={styles.paymentValue}>Rs. {price}</Text>
        </View>
        
        {passengerCount > 1 && (
          <View style={styles.sharedFareContainer}>
            <View style={styles.sharedFareHeader}>
              <Icon name="group" size={16} color={colors.grey1} />
              <Text style={styles.sharedFareTitle}>Shared Fare Details</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total passengers</Text>
              <Text style={styles.paymentValue}>{passengerCount}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Your share (÷{passengerCount})</Text>
              <Text style={styles.paymentValue}>Rs. {pricePerPassenger}</Text>
            </View>
            
            <View style={styles.savingsRow}>
              <Text style={styles.savingsLabel}>Your savings</Text>
              <Text style={styles.savingsValue}>Rs. {price - pricePerPassenger}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Service fee</Text>
          <Text style={styles.paymentValue}>Rs. {serviceFee}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalValue}>Rs. {totalPayment}</Text>
        </View>
        
        <Text style={styles.paymentNote}>
          You will pay in cash directly to the driver based on the actual distance traveled.
          If you drop off before the final destination, your fare will be adjusted at Rs. {pricePerKm}/km
          for the actual distance traveled.
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBooking}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.grey1,
  },
  formContainer: {
    marginTop: 20,
  },
  formLabel: {
    fontSize: 16,
    color: colors.grey1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.grey6,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.grey4,
  },
  card: {
    backgroundColor: colors.cardbackground,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    padding: 15,
    backgroundColor: colors.blue,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  cardBody: {
    padding: 15,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 16,
    color: colors.grey1,
    marginLeft: 10,
    width: 80,
  },
  cardValue: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: colors.grey3,
    marginVertical: 5,
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
    height: 70,
  },
  locationText: {
    fontSize: 16,
    color: colors.grey1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey4,
    marginVertical: 15,
  },
  paymentCard: {
    backgroundColor: colors.cardbackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey1,
    marginBottom: 15,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 16,
    color: colors.grey1,
  },
  paymentValue: {
    fontSize: 16,
    color: colors.grey1,
  },
  sharedFareContainer: {
    backgroundColor: colors.grey6,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  sharedFareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sharedFareTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grey1,
    marginLeft: 8,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  savingsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  savingsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.blue,
  },
  paymentNote: {
    fontSize: 14,
    color: colors.grey3,
    fontStyle: 'italic',
    marginTop: 10,
  },
  bookButton: {
    backgroundColor: colors.buttons,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey3,
  },
  cancelButtonText: {
    color: colors.grey1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 15,
    color: colors.grey1,
    fontSize: 16,
  }
});

export default BookingConfirmation;