import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../Global/Styles";
import { Icon } from "react-native-elements";
import { OriginContext, DestinationContext } from "../../src/Context/Context";
import BottomSheet from "@gorhom/bottom-sheet";
import { GOOGLE_MAPS_APIKEY } from "@env";
import DistancetoDestination from "../Components/DistancetoDestination";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function RequestScreen() {
  const { origin } = useContext(OriginContext);
  const { destination } = useContext(DestinationContext);

  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [userOrigin, setUserOrigin] = useState({
    latitude: origin?.latitude || 0,
    longitude: origin?.longitude || 0,
  });

  const [userDestination, setUserDestination] = useState({
    latitude: destination?.latitude || 0,
    longitude: destination?.longitude || 0,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    setUserOrigin({
      latitude: origin?.latitude || 0,
      longitude: origin?.longitude || 0,
    });

    setUserDestination({
      latitude: destination?.latitude || 0,
      longitude: destination?.longitude || 0,
    });

    // Save recent search if both origin and destination are set
    if (origin && destination && origin.name && destination.name) {
      const saveRecentSearch = async () => {
        try {
          const newSearch = {
            from: origin.name,
            to: destination.name,
          };
          let recent = await AsyncStorage.getItem("recentSearches");
          recent = recent ? JSON.parse(recent) : [];
          // Remove duplicate if exists
          recent = recent.filter(
            (item) =>
              !(item.from === newSearch.from && item.to === newSearch.to)
          );
          // Add new search to the front
          recent.unshift(newSearch);
          // Keep only the last 2
          if (recent.length > 2) recent = recent.slice(0, 2);
          await AsyncStorage.setItem("recentSearches", JSON.stringify(recent));
        } catch (e) {
          console.error("Failed to save recent search", e);
        }
      };
      saveRecentSearch();
    }
  }, [origin, destination]);

  useEffect(() => {
    if (origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }
      );
    }
  }, [origin, destination]);

  useEffect(() => {
    const fetchDirections = async () => {
      if (origin && destination) {
        const originLatLng = `${origin.latitude},${origin.longitude}`;
        const destinationLatLng = `${destination.latitude},${destination.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLatLng}&destination=${destinationLatLng}&key=${GOOGLE_MAPS_APIKEY}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes.length) {
            const points = decodePolyline(
              data.routes[0].overview_polyline.points
            );
            setRouteCoordinates(points);
          }
        } catch (error) {
          console.error("Error fetching directions:", error);
        }
      }
    };

    fetchDirections();
  }, [origin, destination]);

  const decodePolyline = (t) => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < t.length) {
      let b,
        shift = 0,
        result = 0;
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

  return (
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
              style={styles.View6}
            >
              <Text style={styles.text1}>
                {origin?.description || "From ..."}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fromContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("DestinationScreen")}
              style={styles.view7}
            >
              <Text style={styles.text10}>
                {destination?.description || "To ..."}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Distance and Duration Info */}
        {origin && destination && (
          <DistancetoDestination
            fromLat={origin.latitude}
            fromLng={origin.longitude}
            toLat={destination.latitude}
            toLng={destination.longitude}
          />
        )}

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => console.log("Search pressed")}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userOrigin.latitude,
          longitude: userOrigin.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
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

      {/* Bottom Sheet Placeholder */}
      <BottomSheet>{/* You can add content here later */}</BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 16,
    height: SCREEN_HEIGHT * 0.29,
    justifyContent: "center",
    elevation: 5,
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
    zIndex: 10,
    padding: 5,
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.72,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  requestButton: {
    backgroundColor: colors.blue,
    padding: 10,
    borderRadius: 5,
  },
  offerButton: {
    backgroundColor: colors.black,
    padding: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
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
  searchButton: {
    backgroundColor: colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
    elevation: 3,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
