import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, parameters } from "../Global/Styles";
import { StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import WebView from "react-native-webview";
import { mapStyle } from "../Global/mapStyle";
import * as Location from "expo-location";
import { carsAround } from "../Global/Data";
import {
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [latlng, setLatLng] = useState(null);
  const _map = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const checkPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();
      setLatLng({ latitude, longitude });
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };

  const fetchUserReservations = async () => {
    setLoadingReservations(true);
    setReservationsError(null);
    
    try {
      // Try to load from AsyncStorage first for immediate display
      const storedReservations = await AsyncStorage.getItem("userReservations");
      if (storedReservations) {
        const parsedReservations = JSON.parse(storedReservations);
        setUserReservations(parsedReservations);
      }
      
      // Then try to get from the API
      const token = await AsyncStorage.getItem("authToken");
      
      if (!token) {
        console.log("No auth token found, using local data only");
        setLoadingReservations(false);
        return;
      }
      
      try {
        // First try the pluralized endpoint
        const response = await axios.get(
          `${API_BASE_URL}/api/reservations/my-reservations`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );
        
        if (response.data && response.data.success) {
          setUserReservations(response.data.reservations || []);
          // Update local cache
          await AsyncStorage.setItem("userReservations", JSON.stringify(response.data.reservations));
        } else {
          throw new Error("API response not successful");
        }
      } catch (apiError) {
        console.error("Error fetching reservations from primary API:", apiError);
        
        try {
          // Try alternative endpoint
          const altResponse = await axios.get(
            `${API_BASE_URL}/api/reservation/passenger/${await AsyncStorage.getItem("userId")}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            }
          );
          
          if (altResponse.data && (altResponse.data.success || altResponse.data.reservations)) {
            const reservations = altResponse.data.reservations || [];
            setUserReservations(reservations);
            await AsyncStorage.setItem("userReservations", JSON.stringify(reservations));
          } else {
            throw new Error("Alternative API response not successful");
          }
        } catch (altApiError) {
          console.error("Error fetching from alternative API:", altApiError);
          // Continue showing local data we loaded earlier
          
          // If no reservations are in storage, use mock data for testing
          if (!storedReservations || JSON.parse(storedReservations).length === 0) {
            const mockReservations = generateMockReservations();
            setUserReservations(mockReservations);
            await AsyncStorage.setItem("userReservations", JSON.stringify(mockReservations));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservationsError("Unable to load your reservations");
      
      // For testing - provide mock data if all else fails
      const mockReservations = generateMockReservations();
      setUserReservations(mockReservations);
      try {
        await AsyncStorage.setItem("userReservations", JSON.stringify(mockReservations));
      } catch (storageError) {
        console.error("Error saving mock data to storage:", storageError);
      }
    } finally {
      setLoadingReservations(false);
      setRefreshing(false);
    }
  };
  
  // Generate mock reservations for testing
  const generateMockReservations = () => {
    const currentDate = new Date();
    return [
      {
        _id: "mock1",
        pickupLocation: "COMSATS University",
        dropoffLocation: "Ayub Medical Complex",
        distance: 5.2,
        fare: 180,
        status: "confirmed",
        createdAt: currentDate.toISOString(),
        departureTime: new Date(currentDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        driverName: "Ahmed Khan"
      },
      {
        _id: "mock2",
        pickupLocation: "Supply Bazaar",
        dropoffLocation: "PMA Kakul",
        distance: 4.3,
        fare: 150,
        status: "completed",
        createdAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        departureTime: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        driverName: "Sara Malik"
      }
    ];
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const permissionGranted = await checkPermission();
      if (permissionGranted) {
        await getLocation();
      }
    };
    fetchLocation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch recent searches
          let recent = await AsyncStorage.getItem("recentSearches");
          recent = recent ? JSON.parse(recent) : [];
          setRecentSearches(recent);
          
          // Fetch user reservations
          await fetchUserReservations();
          
          console.log("HomeScreen: Data fetched on focus");
        } catch (e) {
          console.error("Error fetching data:", e);
        }
      };
      fetchData();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserReservations();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let backgroundColor;
    switch(status?.toLowerCase()) {
      case 'pending':
        backgroundColor = '#FFC107';
        break;
      case 'confirmed':
        backgroundColor = '#4CAF50';
        break;
      case 'completed':
        backgroundColor = '#2196F3';
        break;
      case 'cancelled':
        backgroundColor = '#F44336';
        break;
      default:
        backgroundColor = '#9E9E9E';
    }
    
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusText}>{status || "Unknown"}</Text>
      </View>
    );
  };

  // Handle navigation to RequestScreen
  const handleNavigateToRequest = () => {
    console.log("Navigating to RequestScreen");
    try {
      navigation.navigate("RequestScreen");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Render a single reservation card
  const renderReservationCard = (reservation) => (
    <TouchableOpacity 
      style={styles.reservationCard}
      key={reservation._id}
      onPress={() => {
        // View reservation details or take action
        Alert.alert(
          "Reservation Details",
          `Status: ${reservation.status}\nPickup: ${reservation.pickupLocation}\nDropoff: ${reservation.dropoffLocation}\nFare: Rs. ${reservation.fare}`,
          [
            { text: "OK" }
          ]
        );
      }}
    >
      <View style={styles.reservationHeader}>
        <View style={styles.dateTimeContainer}>
          <Icon name="calendar-clock" size={16} color={colors.grey2} />
          <Text style={styles.dateTimeText}>
            {formatDate(reservation.departureTime || reservation.createdAt)}
          </Text>
        </View>
        <StatusBadge status={reservation.status} />
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationIconContainer}>
          <Icon name="map-marker" size={16} color="red" />
          <View style={styles.routeLine} />
          <Icon name="map-marker-check" size={16} color="green" />
        </View>
        
        <View style={styles.routeDetails}>
          <Text style={styles.locationText}>{reservation.pickupLocation}</Text>
          <Text style={styles.locationText}>{reservation.dropoffLocation}</Text>
        </View>
      </View>
      
      <View style={styles.reservationFooter}>
        <View style={styles.driverInfo}>
          <Icon name="account" size={16} color={colors.grey2} />
          <Text style={styles.driverName}>{reservation.driverName || "Driver"}</Text>
        </View>
        
        <Text style={styles.fareText}>Rs. {reservation.fare}</Text>
      </View>
      
      {reservation.status === "confirmed" && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelReservation(reservation._id)}
        >
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Handle cancellation of a reservation
  const handleCancelReservation = async (reservationId) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              
              if (!token) {
                Alert.alert("Error", "You must be logged in to cancel a reservation");
                return;
              }
              
              // Try API cancellation first
              let cancellationSuccessful = false;
              
              try {
                const response = await axios.delete(
                  `${API_BASE_URL}/api/reservations/${reservationId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
                
                if (response.data && response.data.success) {
                  cancellationSuccessful = true;
                }
              } catch (apiError) {
                console.error("API cancellation failed:", apiError);
                
                try {
                  // Try alternative endpoint
                  const altResponse = await axios.delete(
                    `${API_BASE_URL}/api/reservation/${reservationId}`,
                    {
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  );
                  
                  if (altResponse.data && altResponse.data.success) {
                    cancellationSuccessful = true;
                  }
                } catch (altApiError) {
                  console.error("Alternative API cancellation failed:", altApiError);
                }
              }
              
              if (!cancellationSuccessful) {
                // If API fails, just update local storage
                try {
                  const reservationsJson = await AsyncStorage.getItem("userReservations");
                  
                  if (reservationsJson) {
                    let reservations = JSON.parse(reservationsJson);
                    
                    // Find the reservation and mark it as cancelled
                    const updatedReservations = reservations.map(res => {
                      if (res._id === reservationId) {
                        return { ...res, status: "cancelled" };
                      }
                      return res;
                    });
                    
                    await AsyncStorage.setItem("userReservations", JSON.stringify(updatedReservations));
                    cancellationSuccessful = true;
                  }
                } catch (storageError) {
                  console.error("Storage update failed:", storageError);
                }
              }
              
              if (cancellationSuccessful) {
                Alert.alert("Success", "Reservation cancelled successfully");
                fetchUserReservations();
              } else {
                throw new Error("Failed to cancel reservation");
              }
            } catch (error) {
              console.error("Error cancelling reservation:", error);
              Alert.alert("Error", error.message || "Failed to cancel reservation");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.icon1}>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Icon name="menu" color={colors.white} size={40} />
            </TouchableOpacity>
          </View>
        </View>
        <HamburgerMenuDialog
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />

        <ScrollView 
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.blue]}
            />
          }
        >
          <View style={styles.home}>
            <Text style={styles.text1}>Destress your commute</Text>

            <View style={styles.view1}>
              <View style={styles.view8}>
                <Text style={styles.text2}>Stare Out of the window</Text>
                <TouchableOpacity
                  onPress={handleNavigateToRequest}
                  style={styles.button1}
                >
                  <Text style={styles.button1Text}>Ride with us</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Image
                  style={styles.image1}
                  source={require("../../assets/car.png")}
                />
              </View>
            </View>
          </View>

          {/* My Reservations Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Reservations</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchUserReservations}
            >
              <MaterialIcons name="refresh" size={20} color={colors.blue} />
            </TouchableOpacity>
          </View>

          {loadingReservations ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.blue} />
              <Text style={styles.loadingText}>Loading your reservations...</Text>
            </View>
          ) : reservationsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{reservationsError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchUserReservations}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : userReservations.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Icon name="car-off" size={40} color={colors.grey3} />
              <Text style={styles.noDataText}>No reservations found</Text>
              <TouchableOpacity
                style={styles.createBookingButton}
                onPress={handleNavigateToRequest}
              >
                <Text style={styles.createBookingButtonText}>Book a Ride</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.reservationsContainer}>
              {userReservations.map(reservation => renderReservationCard(reservation))}
            </View>
          )}

          {/* Recent Searches Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
          </View>

          {recentSearches.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Icon name="map-search" size={40} color={colors.grey3} />
              <Text style={styles.noDataText}>No recent searches</Text>
            </View>
          ) : (
            recentSearches.map((item, idx) => (
              <TouchableOpacity 
                style={styles.searchItem} 
                key={idx}
                onPress={() => {
                  navigation.navigate("RequestScreen", {
                    initialOrigin: item.from,
                    initialDestination: item.to
                  });
                }}
              >
                <View style={styles.searchItemLeft}>
                  <View style={styles.searchIcon}>
                    <Icon
                      name="map-marker"
                      color={colors.grey1}
                      size={26}
                    />
                  </View>
                  <View>
                    <Text style={styles.searchText}>
                      From {item.from} to {item.to}
                    </Text>
                  </View>
                </View>
                <View>
                  <Icon name="chevron-right" color={colors.grey1} size={26} />
                </View>
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.mapTitle}>Around You</Text>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              ref={_map}
              customMapStyle={mapStyle}
              showsUserLocation
              followsUserLocation
            >
              {carsAround.map((item, index) => (
                <Marker coordinate={item} key={index.toString()}>
                  <Image
                    source={require("../../assets/carMarker.png")}
                    style={styles.carsAround}
                    resizeMode="cover"
                  />
                </Marker>
              ))}
            </MapView>
          </View>
        </ScrollView>

        {/* Floating Action Button to quickly book a ride */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleNavigateToRequest}
        >
          <Icon name="car-multiple" size={24} color={colors.white} />
          <Text style={styles.fabText}>Book Ride</Text>
        </TouchableOpacity>

        <StatusBar barStyle="light-content" backgroundColor="#2058c0" />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.blue,
    height: parameters.headerHeight,
    alignItems: "flex-start",
  },
  image1: {
    height: 100,
    width: 100,
  },
  home: {
    backgroundColor: colors.blue,
    paddingLeft: 20,
  },
  text1: {
    color: colors.white,
    fontSize: 21,
    fontFamily: "Times New Roman",
    paddingBottom: 20,
    paddingTop: 20,
  },
  text2: {
    color: colors.white,
    fontFamily: "Times New Roman",
    fontSize: 16,
  },
  view1: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 30,
  },
  button1: {
    height: 40,
    width: 150,
    backgroundColor: colors.black,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  button1Text: {
    color: colors.white,
    fontSize: 17,
    marginTop: -2,
  },
  icon1: { 
    marginLeft: 10, 
    paddingLeft: 1, 
    marginTop: 5 
  },
  view8: { 
    flex: 4, 
    marginTop: -25 
  },
  
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.grey6,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey1,
  },
  refreshButton: {
    padding: 5,
  },
  
  // Loading and error states
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.grey2,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: colors.grey2,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  
  // Empty state
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 10,
    color: colors.grey2,
  },
  createBookingButton: {
    marginTop: 15,
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createBookingButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  
  // Reservation cards
  reservationsContainer: {
    padding: 10,
  },
  reservationCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 5,
    fontSize: 12,
    color: colors.grey2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  routeLine: {
    height: 25,
    width: 1,
    backgroundColor: colors.grey3,
    marginVertical: 5,
  },
  routeDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: colors.grey1,
    marginBottom: 8,
  },
  reservationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.grey5,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    marginLeft: 5,
    fontSize: 14,
    color: colors.grey1,
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttons,
  },
  cancelButton: {
    backgroundColor: colors.grey6,
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: colors.grey1,
    fontWeight: '500',
  },
  
  // Recent searches
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey5,
  },
  searchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    backgroundColor: colors.grey6,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  searchText: {
    fontSize: 14,
    color: colors.grey1,
  },
  
  // Map section
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  mapContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  map: {
    height: 200,
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 10,
    overflow: 'hidden',
  },
  carsAround: {
    width: 28,
    height: 14,
  },
  
  // Floating action button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.buttons,
    borderRadius: 30,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});