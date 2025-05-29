import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { colors } from "../Global/Styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const AvailableCarpoolsScreen = () => {
  const navigation = useNavigation();
  const [carpoolOffers, setCarpoolOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarpoolOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/api/carpool/available`,
        { headers }
      );

      if (response.data && Array.isArray(response.data.carpools)) {
        const formattedOffers = response.data.carpools.map(offer => ({
          id: offer._id,
          driverName: offer.driverName,
          startLocation: offer.startLocation,
          endLocation: offer.endLocation,
          viaRoute: offer.viaRoute || "",
          seatsAvailable: offer.seatsAvailable,
          farePerKm: offer.farePerKm, // Price per km
          totalDistance: offer.totalDistance || 0,
          departureTime: new Date(offer.departureTime).toLocaleString(),
          date: new Date(offer.departureTime).toLocaleDateString(),
          time: new Date(offer.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setCarpoolOffers(formattedOffers);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load offers");
      
      if (err.response?.status === 401) {
        Alert.alert(
          "Session Expired",
          "Please login again",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCarpoolOffers);
    return unsubscribe;
  }, [navigation]);

  const handleBookRide = (item) => {
    navigation.navigate("BookingConfirmation", {
      carpoolId: item.id,
      origin: item.startLocation,
      destination: item.endLocation,
      distance: item.totalDistance,
      price: Math.round(item.totalDistance * item.farePerKm),
      pricePerKm: item.farePerKm,
      driverName: item.driverName,
      departureTime: item.departureTime
    });
  };

  const renderOfferItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.offerCard}
      onPress={() => handleBookRide(item)}
    >
      <View style={styles.offerHeader}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <Text style={styles.offerTime}>{item.time}</Text>
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.routeIconContainer}>
          <Icon name="map-marker" size={18} color="#FF3B30" />
          <View style={styles.routeLine} />
          <Icon name="map-marker-check" size={18} color="#4CD964" />
        </View>
        
        <View style={styles.routeTextContainer}>
          <Text style={styles.routeText}>{item.startLocation}</Text>
          <Text style={styles.routeText}>{item.endLocation}</Text>
        </View>
      </View>
      
      {item.viaRoute && (
        <View style={styles.viaRouteContainer}>
          <Icon name="routes" size={14} color={colors.grey1} />
          <Text style={styles.viaRouteText}>Via: {item.viaRoute}</Text>
        </View>
      )}
      
      <View style={styles.priceInfoContainer}>
        <View style={styles.infoItem}>
          <Icon name="seat" size={16} color={colors.grey1} />
          <Text style={styles.infoText}>{item.seatsAvailable} seats</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="map-marker-distance" size={16} color={colors.grey1} />
          <Text style={styles.infoText}>{item.totalDistance.toFixed(1)} km</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="cash" size={16} color={colors.grey1} />
          <Text style={styles.infoText}>Rs. {item.farePerKm}/km</Text>
        </View>
      </View>
      
      <View style={styles.offerFooter}>
        <Text style={styles.totalPrice}>
          Total: Rs. {Math.round(item.totalDistance * item.farePerKm)}
        </Text>
       
      </View>
      
      <Text style={styles.dateText}>{item.date}</Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="car-off" size={60} color={colors.grey3} />
      <Text style={styles.emptyText}>No carpool offers available in Abbottabad area</Text>
      
      <TouchableOpacity 
        style={styles.createRideButton}
        onPress={() => navigation.navigate("OfferingCarpool")}
      >
        <Text style={styles.createRideButtonText}>Create a Ride</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Carpools</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchCarpoolOffers}
        >
          <Icon name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Abbottabad Region</Text>
        <Text style={styles.filterSubtitle}>Pay per kilometer traveled</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.blue} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color={colors.grey2} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCarpoolOffers}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={carpoolOffers}
          keyExtractor={(item) => item.id}
          renderItem={renderOfferItem}
          contentContainerStyle={styles.offersList}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchCarpoolOffers}
              colors={[colors.blue]}
            />
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate("OfferingCarpool")}
      >
        <Icon name="plus" size={24} color={colors.white} />
        <Text style={styles.floatingButtonText}>Offer Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pagebackground,
  },
  header: {
    backgroundColor: colors.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  refreshButton: {
    padding: 5,
  },
  filterContainer: {
    backgroundColor: colors.white,
    padding: 15,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grey1,
  },
  filterSubtitle: {
    fontSize: 14,
    color: colors.grey2,
    marginTop: 5,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
  },
  errorText: {
    color: colors.grey1,
    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  offersList: {
    padding: 15,
    paddingBottom: 80, // Extra padding for floating button
  },
  offerCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  offerTime: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  routeIconContainer: {
    width: 25,
    alignItems: 'center',
  },
  routeLine: {
    height: 20,
    width: 1,
    backgroundColor: colors.grey4,
    marginVertical: 3,
  },
  routeTextContainer: {
    flex: 1,
    justifyContent: 'space-between',
    height: 50,
    marginLeft: 10,
  },
  routeText: {
    fontSize: 15,
    color: colors.grey1,
  },
  viaRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  viaRouteText: {
    fontSize: 13,
    color: colors.grey2,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  priceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.grey6,
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.grey1,
    marginLeft: 5,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
  },
  bookButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 14,
  },
  dateText: {
    color: colors.grey2,
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: colors.grey2,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
  },
  createRideButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  createRideButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.buttons,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
  },
  floatingButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default AvailableCarpoolsScreen;