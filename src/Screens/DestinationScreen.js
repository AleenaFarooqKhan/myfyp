DestinationScreen
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { colors } from '../Global/Styles';
import { Icon } from 'react-native-elements';
import { OriginContext, DestinationContext } from '../Context/Context';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { GOOGLE_MAPS_APIKEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Abbottabad region for location bias
const ABBOTTABAD_REGION = {
  latitude: 34.1688,
  longitude: 73.2215,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Check if point is in Abbottabad (larger radius to include suburbs)
const isPointInAbbottabad = (lat, lng) => {
  const abbottabadCenterLat = 34.1688;
  const abbottabadCenterLng = 73.2215;
  const maxDistanceKm = 15; // Expanded radius to include more areas
  
  // Calculate distance using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat - abbottabadCenterLat) * Math.PI / 180;
  const dLng = (lng - abbottabadCenterLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(abbottabadCenterLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  
  return distance <= maxDistanceKm;
};

const DestinationScreen = ({ navigation }) => {
  const { origin, dispatchOrigin } = useContext(OriginContext);
  const { destination, dispatchDestination } = useContext(DestinationContext);

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myLocation, setMyLocation] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Focus input and get current location on component mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
    
    getCurrentLocation();
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem("recentSearches");
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Request permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        // Check if current location is within Abbottabad region
        if (isPointInAbbottabad(latitude, longitude)) {
          // Get address information
          const address = await reverseGeocode(latitude, longitude);
          
          setMyLocation({
            latitude,
            longitude,
            name: address || 'Current Location',
            description: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
        } else {
          // If not in Abbottabad, default to Lady Garden
          setMyLocation({
            latitude: 34.1723,
            longitude: 73.2249,
            name: 'Lady Garden',
            description: 'Lady Garden, Abbottabad'
          });
        }
      } else {
        // Default to Lady Garden if permissions not granted
        setMyLocation({
          latitude: 34.1723,
          longitude: 73.2249,
          name: 'Lady Garden',
          description: 'Lady Garden, Abbottabad'
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      // Default to Lady Garden if error
      setMyLocation({
        latitude: 34.1723,
        longitude: 73.2249,
        name: 'Lady Garden',
        description: 'Lady Garden, Abbottabad'
      });
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Google Places API with Abbottabad as location bias
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&location=${ABBOTTABAD_REGION.latitude},${ABBOTTABAD_REGION.longitude}&radius=15000&strictbounds=false&types=geocode|establishment&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        // Process each prediction to get full details
        const detailedResults = await Promise.all(
          data.predictions.map(async (prediction) => {
            // Get place details for coordinates
            const detailsResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_APIKEY}`
            );
            const detailsData = await detailsResponse.json();
            
            if (detailsData.result && detailsData.result.geometry) {
              const { lat, lng } = detailsData.result.geometry.location;
              
              // Only include results within Abbottabad region
              if (isPointInAbbottabad(lat, lng)) {
                return {
                  id: prediction.place_id,
                  name: prediction.structured_formatting.main_text,
                  description: prediction.structured_formatting.secondary_text,
                  latitude: lat,
                  longitude: lng
                };
              }
            }
            return null;
          })
        );
        
        // Filter out null results (places outside Abbottabad)
        setSearchResults(detailedResults.filter(result => result !== null));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      
      // Fallback to open map picker if API fails
      Alert.alert(
        "Search Error",
        "Unable to fetch locations. Would you like to select a location on the map instead?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Use Map",
            onPress: () => setShowMapPicker(true)
          }
        ]
      );
      
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = (item, type) => {
    if (type === 'origin') {
      dispatchOrigin({ type: 'ADD_ORIGIN', payload: item });
    } else {
      dispatchDestination({ type: 'ADD_DESTINATION', payload: item });
    }
    
    // Save to recent searches
    saveRecentSearch(item, type);
    
    // If both origin and destination are set, go back to request screen
    if (type === 'destination' && origin) {
      navigation.navigate('RequestScreen');
    } else if (type === 'origin' && destination) {
      navigation.navigate('RequestScreen');
    }
  };

  const saveRecentSearch = async (item, type) => {
    try {
      if (type === 'origin' && !destination) return;
      if (type === 'destination' && !origin) return;
      
      const otherLocation = type === 'origin' ? destination : origin;
      
      const newSearch = {
        from: type === 'origin' ? item.name : otherLocation.name,
        to: type === 'destination' ? item.name : otherLocation.name,
      };
      
      let recent = await AsyncStorage.getItem("recentSearches");
      recent = recent ? JSON.parse(recent) : [];
      
      // Remove duplicates
      recent = recent.filter(
        (r) => !(r.from === newSearch.from && r.to === newSearch.to)
      );
      
      // Add new search to the beginning
      recent.unshift(newSearch);
      
      // Limit to 5 items
      if (recent.length > 5) recent = recent.slice(0, 5);
      
      await AsyncStorage.setItem("recentSearches", JSON.stringify(recent));
      setRecentSearches(recent);
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  // Handle custom location from map
  const handleMapLocationSelect = async () => {
    if (!pickedLocation) {
      Alert.alert("Location Required", "Please select a location on the map");
      return;
    }

    // Check if location is within Abbottabad
    if (!isPointInAbbottabad(pickedLocation.latitude, pickedLocation.longitude)) {
      Alert.alert(
        "Location Error",
        "The selected location is outside Abbottabad region. Please select a location within Abbottabad.",
        [{ text: "OK" }]
      );
      return;
    }

    // Get address for the picked location
    const address = await reverseGeocode(pickedLocation.latitude, pickedLocation.longitude);

    // Create a place object from picked location
    const customPlace = {
      id: `custom_${Date.now()}`,
      name: address || `Custom Location`,
      description: `${pickedLocation.latitude.toFixed(4)}, ${pickedLocation.longitude.toFixed(4)}`,
      latitude: pickedLocation.latitude,
      longitude: pickedLocation.longitude
    };

    // Use the custom place
    if (!origin) {
      handleSelectPlace(customPlace, 'origin');
    } else {
      handleSelectPlace(customPlace, 'destination');
    }

    // Close the map
    setShowMapPicker(false);
    setPickedLocation(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon type="material" name="arrow-back" size={28} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Enter location in Abbottabad"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
              }}
            >
              <Icon type="material" name="clear" size={20} color={colors.grey3} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator 
          style={styles.loadingIndicator} 
          size="large" 
          color={colors.blue} 
        />
      ) : (
        <>
          {/* Origin and Destination Buttons */}
          <View style={styles.locationButtons}>
            {myLocation && (
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => handleSelectPlace(myLocation, !origin ? 'origin' : 'destination')}
              >
                <Icon type="material" name="my-location" size={24} color={colors.blue} />
                <Text style={styles.locationButtonText}>
                  Set {myLocation.name} as {!origin ? 'Origin' : 'Destination'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Custom location from map */}
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => setShowMapPicker(true)}
            >
              <Icon type="material" name="place" size={24} color={colors.blue} />
              <Text style={styles.locationButtonText}>
                Select custom location on map
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                if (!origin) {
                  Alert.alert("Select Origin", "Please select an origin location first");
                  return;
                }
                navigation.navigate("RequestScreen");
              }}
            >
              <Icon type="material" name="search" size={24} color={colors.blue} />
              <Text style={styles.locationButtonText}>Search for carpools</Text>
            </TouchableOpacity>
          </View>
          
          {/* Recent Searches Section */}
          {searchText.length === 0 && recentSearches.length > 0 && (
            <View style={styles.recentSearchesContainer}>
              <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
              {recentSearches.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => {
                    // Set both origin and destination from recent search
                    const originItem = {
                      id: `recent_origin_${index}`,
                      name: item.from,
                      description: `From: ${item.from}`,
                      // We don't have coordinates from recent searches, 
                      // so the user would need to select them again
                    };
                    
                    const destinationItem = {
                      id: `recent_dest_${index}`,
                      name: item.to,
                      description: `To: ${item.to}`,
                    };
                    
                    dispatchOrigin({ type: 'ADD_ORIGIN', payload: originItem });
                    dispatchDestination({ type: 'ADD_DESTINATION', payload: destinationItem });
                    
                    // Navigate back
                    navigation.navigate('RequestScreen');
                  }}
                >
                  <Icon 
                    type="material" 
                    name="history" 
                    size={20} 
                    color={colors.grey2}
                    style={styles.recentSearchIcon}
                  />
                  <View style={styles.recentSearchTextContainer}>
                    <Text style={styles.recentSearchFromTo}>
                      <Text style={styles.fromToLabel}>From: </Text>
                      {item.from}
                    </Text>
                    <Text style={styles.recentSearchFromTo}>
                      <Text style={styles.fromToLabel}>To: </Text>
                      {item.to}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Search Results */}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.resultItem}
                onPress={() => {
                  if (!origin) {
                    handleSelectPlace(item, 'origin');
                  } else {
                    handleSelectPlace(item, 'destination');
                  }
                }}
              >
                <Icon 
                  type="material-community" 
                  name="map-marker-outline" 
                  size={26} 
                  color={colors.grey1}
                />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultPrimaryText}>{item.name}</Text>
                  <Text style={styles.resultSecondaryText}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchText.length > 0 && !isLoading ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    No locations found matching "{searchText}"
                  </Text>
                  <TouchableOpacity
                    style={styles.mapPickerButton}
                    onPress={() => setShowMapPicker(true)}
                  >
                    <Text style={styles.mapPickerButtonText}>
                      Select a custom location on map
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : searchText.length === 0 && recentSearches.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.hintText}>
                    Start typing to search for locations in Abbottabad
                  </Text>
                  <Text style={styles.orText}>- or -</Text>
                  <TouchableOpacity
                    style={styles.mapPickerButton}
                    onPress={() => setShowMapPicker(true)}
                  >
                    <Text style={styles.mapPickerButtonText}>
                      Select a custom location on map
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        </>
      )}
      
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {!origin ? "Set pickup location" : !destination ? "Set dropoff location" : "Ready to search"}
        </Text>
        {origin && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>From:</Text>
            <Text style={styles.statusValue} numberOfLines={1}>{origin.name}</Text>
          </View>
        )}
        {destination && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>To:</Text>
            <Text style={styles.statusValue} numberOfLines={1}>{destination.name}</Text>
          </View>
        )}
      </View>
      
      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowMapPicker(false)}
            >
              <Icon name="close" size={24} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Select a location in Abbottabad
            </Text>
          </View>
          
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={ABBOTTABAD_REGION}
            onPress={(e) => setPickedLocation(e.nativeEvent.coordinate)}
          >
            {pickedLocation && (
              <Marker coordinate={pickedLocation} />
            )}
          </MapView>
          
          <View style={styles.mapControlsContainer}>
            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={handleMapLocationSelect}
            >
              <Text style={styles.confirmLocationText}>
                Confirm Selected Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: colors.white,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey6,
    borderRadius: 5,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 15,
  },
  clearButton: {
    padding: 10,
  },
  locationButtons: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.grey1,
  },
  recentSearchesContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey4,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.grey1,
    marginBottom: 10,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey5,
  },
  recentSearchIcon: {
    marginRight: 15,
  },
  recentSearchTextContainer: {
    flex: 1,
  },
  recentSearchFromTo: {
    fontSize: 14,
    color: colors.grey1,
  },
  fromToLabel: {
    fontWeight: 'bold',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey5,
  },
  resultTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  resultPrimaryText: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
  resultSecondaryText: {
    fontSize: 14,
    color: colors.grey3,
    marginTop: 2,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: colors.grey3,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 16,
    color: colors.grey3,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  orText: {
    fontSize: 14,
    color: colors.grey3,
    marginVertical: 10,
  },
  mapPickerButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  mapPickerButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  statusBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.grey7,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.grey4,
  },
  statusText: {
    fontSize: 14,
    color: colors.grey2,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.grey1,
    width: 45,
  },
  statusValue: {
    fontSize: 14,
    color: colors.blue,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    elevation: 2,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  map: {
    flex: 1,
  },
  mapControlsContainer: {
    padding: 15,
    backgroundColor: colors.white,
  },
  confirmLocationButton: {
    backgroundColor: colors.blue,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmLocationText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default DestinationScreen;