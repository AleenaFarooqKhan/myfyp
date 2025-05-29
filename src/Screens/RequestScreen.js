RequestScreen
import React, { useState, useContext, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  SafeAreaView,
  Modal
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../Global/Styles";
import { Icon } from "react-native-elements";
import { OriginContext, DestinationContext } from "../Context/Context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from "@gorhom/bottom-sheet";
import { GOOGLE_MAPS_APIKEY } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import { isPointInAbbottabad, calculateDistance } from "../../server/src/utils/locationUtils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Abbottabad region coordinates
const ABBOTTABAD_REGION = {
  latitude: 34.1688,
  longitude: 73.2215,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function RequestScreen() {
  const { origin, dispatchOrigin } = useContext(OriginContext);
  const { destination, dispatchDestination } = useContext(DestinationContext);

  const navigation = useNavigation();
  const mapRef = useRef(null);
  
  // BottomSheet configuration
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '70%'], []);
  
  const [userOrigin, setUserOrigin] = useState({
    latitude: origin?.latitude || ABBOTTABAD_REGION.latitude,
    longitude: origin?.longitude || ABBOTTABAD_REGION.longitude,
  });

  const [userDestination, setUserDestination] = useState({
    latitude: destination?.latitude || ABBOTTABAD_REGION.latitude + 0.02,
    longitude: destination?.longitude || ABBOTTABAD_REGION.longitude + 0.02,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [availableCarpools, setAvailableCarpools] = useState([]);
  const [carpoolsLoading, setCarpoolsLoading] = useState(false);
  const [selectedCarpool, setSelectedCarpool] = useState(null);
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log("RequestScreen mounted");
    
    if (origin) {
      setUserOrigin({
        latitude: origin.latitude || userOrigin.latitude,
        longitude: origin.longitude || userOrigin.longitude,
      });
    }

    if (destination) {
      setUserDestination({
        latitude: destination.latitude || userDestination.latitude,
        longitude: destination.longitude || userDestination.longitude,
      });
    }

    if (origin && destination && origin.name && destination.name) {
      // Verify locations are within Abbottabad region
      if (!isPointInAbbottabad(origin.latitude, origin.longitude) || 
          !isPointInAbbottabad(destination.latitude, destination.longitude)) {
        Alert.alert(
          "Location Error",
          "Both pickup and dropoff locations must be within Abbottabad region.",
          [{ text: "OK" }]
        );
        return;
      }
      
      saveRecentSearch();
      fetchDirections();
    }
  }, [origin, destination]);

  // Reset selection when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedCarpool(null);
    });

    return unsubscribe;
  }, [navigation]);

  const saveRecentSearch = async () => {
    try {
      if (!origin?.name || !destination?.name) return;
      
      const newSearch = {
        from: origin.name,
        to: destination.name,
      };
      
      let recent = await AsyncStorage.getItem("recentSearches");
      recent = recent ? JSON.parse(recent) : [];
      
      // Remove duplicates
      recent = recent.filter(
        (item) => !(item.from === newSearch.from && item.to === newSearch.to)
      );
      
      // Add new search to the beginning
      recent.unshift(newSearch);
      
      // Limit to 5 items
      if (recent.length > 5) recent = recent.slice(0, 5);
      
      await AsyncStorage.setItem("recentSearches", JSON.stringify(recent));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  // Utility function for direct distance calculation when Google API fails
  const calculateDirectDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const fetchDirections = async () => {
    if (!origin || !destination) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const originLatLng = `${origin.latitude},${origin.longitude}`;
      const destinationLatLng = `${destination.latitude},${destination.longitude}`;
      
      try {
        // Try Google API directions first
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLatLng}&destination=${destinationLatLng}&key=${GOOGLE_MAPS_APIKEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK" && data.routes.length) {
          const route = data.routes[0];
          const points = decodePolyline(route.overview_polyline.points);
          setRouteCoordinates(points);
          
          // Get distance in kilometers and duration in minutes
          const distanceValue = route.legs[0].distance.value / 1000; // convert meters to km
          const durationValue = Math.ceil(route.legs[0].duration.value / 60); // convert seconds to minutes
          
          setDistance(distanceValue);
          setDuration(durationValue);
          
          // Fit map to show the route
          if (mapRef.current) {
            mapRef.current.fitToCoordinates(points, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        } else {
          throw new Error("Couldn't find directions");
        }
      } catch (googleApiError) {
        console.warn("Google Directions API failed, using direct calculation:", googleApiError);
        
        // Fallback to direct distance calculation
        const directDistance = calculateDirectDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude
        );
        
        // Create a simple straight line for the route
        const simplifiedRoute = [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        ];
        
        setRouteCoordinates(simplifiedRoute);
        setDistance(directDistance);
        
        // Estimate duration (assume 40 km/h average speed)
        const estimatedDurationMinutes = Math.ceil((directDistance / 40) * 60);
        setDuration(estimatedDurationMinutes);
        
        // Fit map to show the route
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(simplifiedRoute, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching directions:", err);
      setError("Error fetching directions");
      
      // Set fallback distance if we can't get it from Google
      const directDistance = calculateDirectDistance(
        origin.latitude,
        origin.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistance(directDistance);
    } finally {
      setLoading(false);
    }
  };

  const searchForCarpools = async () => {
    if (!origin || !destination) {
      alert("Please select pickup and dropoff locations");
      return;
    }
    
    // Check if locations are within Abbottabad region
    if (!isPointInAbbottabad(origin.latitude, origin.longitude) || 
        !isPointInAbbottabad(destination.latitude, destination.longitude)) {
      Alert.alert(
        "Location Error",
        "Both pickup and dropoff locations must be within Abbottabad region.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setCarpoolsLoading(true);
    try {
      // Get user token
      const token = await AsyncStorage.getItem("authToken");
      
      // Calculate distance if not already set
      let calculatedDistance = distance;
      if (!calculatedDistance) {
        calculatedDistance = calculateDirectDistance(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude
        );
      }
      
      // Try to search for matching carpools first
      let carpoolData = [];
      try {
        console.log(`Searching carpools at: ${API_BASE_URL}/api/carpool/search`);
        const searchResponse = await axios.get(
          `${API_BASE_URL}/api/carpool/search`, 
          {
            params: {
              startLat: origin.latitude,
              startLng: origin.longitude,
              endLat: destination.latitude,
              endLng: destination.longitude,
              distance: calculatedDistance,
              radius: 5
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 5000 // 5 second timeout
          }
        );
        
        console.log("Search response:", searchResponse.data);
        carpoolData = searchResponse.data.carpools || [];
      } catch (searchError) {
        console.warn("Matching carpool search failed, fetching all carpools:", searchError.message);
        
        // If specific search fails, get all available carpools as fallback
        try {
          const allCarpoolsResponse = await axios.get(
            `${API_BASE_URL}/api/carpool/available`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              timeout: 5000
            }
          );
          
          carpoolData = allCarpoolsResponse.data.carpools || [];
          console.log("Fetched all carpools:", carpoolData.length);
        } catch (allCarpoolsError) {
          console.error("Failed to fetch all carpools:", allCarpoolsError.message);
          
          // Current timestamp for setting departure time
          const now = new Date();
          
          // Provide mock data as a last resort
          carpoolData = [
            {
              _id: "mock1",
              driverName: "Ahmed Khan",
              startLocation: origin ? origin.name : "Lady Garden",
              endLocation: destination ? destination.name : "PMA Kakul",
              farePerKm: 20,
              seatsAvailable: 3,
              departureTime: new Date(now.getTime() + 30*60000).toISOString(),
              driverRating: 4.8,
              vehicleModel: "Honda City"
            },
            {
              _id: "mock2",
              driverName: "Sara Malik",
              startLocation: origin ? origin.name : "COMSATS University",
              endLocation: destination ? destination.name : "Ayub Medical Complex",
              farePerKm: 18,
              seatsAvailable: 2,
              departureTime: new Date(now.getTime() + 15*60000).toISOString(),
              driverRating: 4.5,
              vehicleModel: "Suzuki Swift"
            },
            {
              _id: "mock3",
              driverName: "Usman Ali",
              startLocation: origin ? origin.name : "Supply Bazaar",
              endLocation: destination ? destination.name : "Lady Garden",
              farePerKm: 22,
              seatsAvailable: 4,
              departureTime: new Date(now.getTime() + 45*60000).toISOString(),
              driverRating: 4.9,
              vehicleModel: "Toyota Corolla"
            }
          ];
        }
      }
      
      // Calculate price for each carpool based on distance
      const carpoolsWithPrice = carpoolData.map(carpool => {
        // Ensure we have a valid farePerKm value
        const ratePerKm = carpool.farePerKm || 20; // Default to 20 PKR if not specified
        
        // Calculate fare based on distance
        const price = Math.round(calculatedDistance * ratePerKm);
        
        // Cost per passenger calculation (if there are already passengers)
        const totalPassengers = (carpool.passengers?.length || 0) + 1; // Including this new passenger
        const pricePerPassenger = Math.round(price / totalPassengers);
        
        return {
          ...carpool,
          distance: calculatedDistance.toFixed(1),
          calculatedPrice: price,
          pricePerKm: ratePerKm,
          pricePerPassenger: pricePerPassenger,
          passengerCount: totalPassengers
        };
      });
      
      setAvailableCarpools(carpoolsWithPrice);
      
      // Show carpools in bottom sheet or modal
      if (carpoolsWithPrice.length > 0) {
        bottomSheetRef.current?.expand();
        if (carpoolsWithPrice.length === 1) {
          setSelectedCarpool(carpoolsWithPrice[0]);
        }
      } else {
        // No carpools found
        Alert.alert(
          "No Carpools Available",
          "Would you like to create a carpool for this route?",
          [
            {
              text: "No",
              style: "cancel"
            },
            { 
              text: "Create Carpool", 
              onPress: () => navigation.navigate("OfferingCarpool")
            }
          ]
        );
      }
    } catch (error) {
      console.error("Carpool search failed:", error);
      Alert.alert(
        "Search Error", 
        "Failed to find carpools. Please try again."
      );
      
      // Set mock data as fallback
      const mockCarpools = [
        {
          _id: "mock1",
          driverName: "Ahmed Khan",
          startLocation: origin ? origin.name : "Lady Garden",
          endLocation: destination ? destination.name : "PMA Kakul",
          farePerKm: 20,
          seatsAvailable: 3,
          departureTime: new Date(Date.now() + 30*60000).toISOString(),
          passengerCount: 2,
          pricePerPassenger: Math.round((distance * 20) / 2),
          driverRating: 4.8,
          vehicleModel: "Honda City"
        },
        {
          _id: "mock2",
          driverName: "Sara Malik",
          startLocation: origin ? origin.name : "COMSATS University",
          endLocation: destination ? destination.name : "Ayub Medical Complex",
          farePerKm: 18,
          seatsAvailable: 2,
          departureTime: new Date(Date.now() + 15*60000).toISOString(),
          passengerCount: 1,
          pricePerPassenger: Math.round(distance * 18),
          driverRating: 4.5,
          vehicleModel: "Suzuki Swift"
        }
      ];
      
      const mocksWithPrice = mockCarpools.map(carpool => ({
        ...carpool,
        distance: distance.toFixed(1),
        calculatedPrice: Math.round(distance * carpool.farePerKm)
      }));
      
      setAvailableCarpools(mocksWithPrice);
      bottomSheetRef.current?.expand();
    } finally {
      setCarpoolsLoading(false);
    }
  };

  const handleSelectCarpool = (carpool) => {
    setSelectedCarpool(carpool);
  };

  const proceedToBooking = () => {
    if (!selectedCarpool) {
      Alert.alert("Selection Required", "Please select a carpool to continue");
      return;
    }
    
    // Navigate to booking confirmation screen with all required details
    navigation.navigate("BookingConfirmation", {
      carpoolId: selectedCarpool._id,
      origin: origin?.name || selectedCarpool.startLocation,
      destination: destination?.name || selectedCarpool.endLocation,
      distance: parseFloat(selectedCarpool.distance),
      price: selectedCarpool.calculatedPrice,
      pricePerKm: selectedCarpool.pricePerKm,
      pricePerPassenger: selectedCarpool.pricePerPassenger,
      passengerCount: selectedCarpool.passengerCount,
      driverName: selectedCarpool.driverName,
      departureTime: selectedCarpool.departureTime,
      driverRating: selectedCarpool.driverRating || 4.5,
      vehicleModel: selectedCarpool.vehicleModel || "Not specified",
      originCoords: {
        latitude: origin?.latitude || ABBOTTABAD_REGION.latitude,
        longitude: origin?.longitude || ABBOTTABAD_REGION.longitude
      },
      destinationCoords: {
        latitude: destination?.latitude || ABBOTTABAD_REGION.latitude + 0.02,
        longitude: destination?.longitude || ABBOTTABAD_REGION.longitude + 0.02
      },
      seatsAvailable: selectedCarpool.seatsAvailable
    });
  };

  const openCarpoolModal = () => {
    if (availableCarpools.length === 0) {
      searchForCarpools();
      return;
    }
    setModalVisible(true);
  };

  const decodePolyline = (t) => {
    // Polyline decoding function (unchanged)
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const renderCarpoolItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.carpoolItem, 
        selectedCarpool && selectedCarpool._id === item._id && styles.selectedCarpoolItem
      ]}
      onPress={() => handleSelectCarpool(item)}
      activeOpacity={0.7}
    >
      <View style={styles.carpoolHeader}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <Text style={styles.departureTime}>
          {new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.locationIconContainer}>
          <Icon name="location-on" size={16} color="red" />
          <View style={styles.routeLine} />
          <Icon name="location-on" size={16} color="green" />
        </View>
        
        <View style={styles.routeDetails}>
          <Text style={styles.locationText}>{item.startLocation}</Text>
          <Text style={styles.locationText}>{item.endLocation}</Text>
        </View>
      </View>
      
      <View style={styles.carpoolDetails}>
        <View style={styles.detailRow}>
          <Icon name="airline-seat-recline-normal" size={16} color={colors.grey2} />
          <Text style={styles.detailText}>{item.seatsAvailable} seats available</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="route" size={16} color={colors.grey2} />
          <Text style={styles.detailText}>{item.distance} km total</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color={colors.grey2} />
          <Text style={styles.detailText}>Rs. {item.pricePerKm}/km</Text>
        </View>
        
        {item.passengerCount > 1 && (
          <View style={styles.detailRow}>
            <Icon name="group" size={16} color={colors.grey2} />
            <Text style={styles.detailText}>
              Cost divided: Rs. {item.pricePerPassenger} (among {item.passengerCount} passengers)
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.priceContainer}>
        <View>
          <Text style={styles.totalPrice}>Rs. {item.calculatedPrice}</Text>
          {item.passengerCount > 1 && (
            <Text style={styles.dividedPrice}>Your share: Rs. {item.pricePerPassenger}</Text>
          )}
        </View>
        {selectedCarpool && selectedCarpool._id === item._id ? (
          <View style={styles.selectedBadge}>
            <Icon name="check-circle" size={20} color={colors.white} />
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.selectButton}
            onPress={() => handleSelectCarpool(item)}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Full modal for showing carpools
  const renderCarpoolModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Available Carpools</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color={colors.grey1} />
            </TouchableOpacity>
          </View>
          
          {carpoolsLoading ? (
            <ActivityIndicator size="large" color={colors.blue} style={{marginTop: 30}} />
          ) : availableCarpools.length > 0 ? (
            <FlatList
              data={availableCarpools}
              renderItem={renderCarpoolItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.modalList}
            />
          ) : (
            <View style={styles.noCarpoolsContainer}>
              <Icon name="directions-car" size={50} color={colors.grey3} />
              <Text style={styles.noCarpoolsText}>
                No carpools available for this route.
              </Text>
            </View>
          )}
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                !selectedCarpool && styles.modalConfirmButtonDisabled
              ]}
              disabled={!selectedCarpool}
              onPress={() => {
                setModalVisible(false);
                proceedToBooking();
              }}
            >
              <Text style={styles.modalConfirmText}>Book Selected</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Top White Section */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>

            {/* From and To Text Fields */}
            <View style={styles.rowContainer}>
              <Image
                source={require("../../assets/transit.png")}
                style={styles.transitIcon}
              />

              <View style={styles.fromContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("DestinationScreen")}
                  style={styles.viewInput}
                >
                  <Text style={styles.text1}>
                    {origin?.name || "From ..."}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.fromContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("DestinationScreen")}
                  style={styles.viewInput}
                >
                  <Text style={styles.text10}>
                    {destination?.name || "To ..."}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Distance and Duration Info */}
            {distance > 0 && (
              <View style={styles.tripInfoContainer}>
                <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
                <Text style={styles.durationText}>≈ {duration} mins</Text>
                <Text style={styles.priceEstimate}>
                  Est. fare: Rs. {Math.round(distance * 20)}
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              {/* Search Button */}
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchForCarpools}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>
                  {carpoolsLoading ? "Searching..." : "Find Carpools"}
                </Text>
              </TouchableOpacity>
              
              {/* View in Modal Button */}
              {availableCarpools.length > 0 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={openCarpoolModal}
                >
                  <Text style={styles.viewAllButtonText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={ABBOTTABAD_REGION}
              showsUserLocation
              followsUserLocation
            >
              {userOrigin.latitude !== 0 && (
                <Marker coordinate={userOrigin} title="From">
                  <Image
                    source={require("../../assets/from.png")}
                    style={{ width: 40, height: 40 }}
                  />
                </Marker>
              )}
              {userDestination.latitude !== 0 && (
                <Marker coordinate={userDestination} title="To" />
              )}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeWidth={4}
                  strokeColor="blue"
                />
              )}
            </MapView>
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.blue} />
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          {/* Bottom Sheet for carpools */}
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
          >
            <View style={styles.bottomSheetContent}>
              <Text style={styles.bottomSheetTitle}>
                {selectedCarpool ? "Selected Carpool" : "Available Carpools"}
              </Text>
              
              {carpoolsLoading ? (
                <ActivityIndicator size="large" color={colors.blue} style={{marginTop: 20}} />
              ) : availableCarpools.length > 0 ? (
                <FlatList
                  data={availableCarpools}
                  renderItem={renderCarpoolItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.carpoolList}
                />
              ) : (
                <View style={styles.noCarpoolsContainer}>
                  <Icon name="directions-car" size={50} color={colors.grey3} />
                  <Text style={styles.noCarpoolsText}>
                    No carpools available for this route.
                  </Text>
                  <TouchableOpacity 
                    style={styles.createCarpoolButton}
                    onPress={() => navigation.navigate("OfferingCarpool")}
                  >
                    <Text style={styles.createCarpoolText}>Create Carpool</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {selectedCarpool && (
                <View style={styles.selectedControls}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setSelectedCarpool(null)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={proceedToBooking}
                  >
                    <Text style={styles.confirmButtonText}>Proceed to Booking</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BottomSheet>
          
          {/* Carpool Modal */}
          {renderCarpoolModal()}
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 16,
    height: SCREEN_HEIGHT * 0.36, // Slightly increased to accommodate the new button
    justifyContent: "center",
    elevation: 5,
    zIndex: 10,
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  transitIcon: {
    width: 40,
    height: 100,
    marginBottom: -100,
    marginRight: 280,
    resizeMode: "contain",
  },
  rowContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-around",
  },
  fromContainer: {
    width: "75%",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    marginBottom: 10,
  },
  backButton: {
    position: "absolute",
    top: -3,
    left: 0,
    zIndex: 20,
    padding: 5,
  },
  text1: {
    fontSize: 14,
    color: colors.grey2,
    textAlign: "center",
  },
  text10: {
    fontSize: 14,
    color: colors.grey2,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchButton: {
    flex: 3,
    backgroundColor: colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
    marginRight: 10,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center',
  },
  viewAllButton: {
    flex: 1,
    backgroundColor: colors.grey1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
  },
  viewAllButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  tripInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.grey6,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  distanceText: {
    fontWeight: 'bold',
    color: colors.grey1,
  },
  durationText: {
    color: colors.grey1,
  },
  priceEstimate: {
    fontWeight: 'bold',
    color: colors.blue,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  carpoolList: {
    paddingBottom: 20,
  },
  carpoolItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
    elevation: 2,
  },
  selectedCarpoolItem: {
    borderLeftWidth: 3,
    borderLeftColor: colors.buttons,
    backgroundColor: '#f6f9ff',
  },
  carpoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  departureTime: {
    color: colors.blue,
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 5,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  routeLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.grey3,
    marginVertical: 3,
  },
  routeDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: colors.grey1,
    marginBottom: 5,
  },
  carpoolDetails: {
    marginVertical: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  detailText: {
    marginLeft: 5,
    color: colors.grey1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.grey5,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.blue,
  },
  dividedPrice: {
    fontSize: 14,
    color: 'green',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: colors.blue,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  selectButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttons,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedText: {
    color: colors.white,
    marginLeft: 5,
    fontWeight: '500',
  },
  noCarpoolsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  noCarpoolsText: {
    color: colors.grey1,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  createCarpoolButton: {
    backgroundColor: colors.blue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  createCarpoolText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  selectedControls: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.grey5,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.grey4,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.grey1,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.buttons,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  viewInput: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.grey1,
  },
  modalList: {
    padding: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.grey5,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.grey6,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.grey1,
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 2,
    padding: 12,
    backgroundColor: colors.buttons,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: colors.grey4,
  },
  modalConfirmText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});