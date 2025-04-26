import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors } from '../Global/Styles';
import { Icon } from 'react-native-elements';
import { GOOGLE_MAPS_APIKEY } from "@env";  
import { OriginContext, DestinationContext } from '../../src/Context/Context';
import * as Location from 'expo-location';

const DestinationScreen = ({ navigation }) => {
  const { origin, dispatchOrigin } = useContext(OriginContext);
  const { destination, dispatchDestination } = useContext(DestinationContext);

  const [location, setLocation] = useState(null);
  const [destinationSelected, setDestinationSelected] = useState(false);

  const textInput1 = useRef(null);
  const textInput2 = useRef(null);

  // Abbottabad's approximate center coordinates
  const ABBOTTABAD_COORDINATES = {
    latitude: 34.148, 
    longitude: 73.249, 
  };

  // Expanded bounds for Abbottabad
  const ABBOTTABAD_BOUNDS = {
    latitudeMin: 34.050,   // Expanded lower latitude
    latitudeMax: 34.180,   // Expanded upper latitude
    longitudeMin: 73.150,  // Expanded lower longitude
    longitudeMax: 73.320,  // Expanded upper longitude
  };

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    };

    getLocation();
  }, []);

  // Function to check if a location is within Abbottabad bounds
  const isLocationWithinAbbottabad = (latitude, longitude) => {
    return (
      latitude >= ABBOTTABAD_BOUNDS.latitudeMin &&
      latitude <= ABBOTTABAD_BOUNDS.latitudeMax &&
      longitude >= ABBOTTABAD_BOUNDS.longitudeMin &&
      longitude <= ABBOTTABAD_BOUNDS.longitudeMax
    );
  };

  // Reverse Geocoding to check if place is in Abbottabad
  const checkIfPlaceIsInAbbottabad = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`);
      const data = await response.json();
      if (data.status === 'OK') {
        const addressComponents = data.results[0].address_components;
        for (let component of addressComponents) {
          if (component.long_name.toLowerCase().includes('abbottabad')) {
            return true;  // The place is within Abbottabad
          }
        }
      }
    } catch (error) {
      console.error('Error with reverse geocoding:', error);
    }
    return false; // If not found, it's outside Abbottabad
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      {/* Google Places Autocomplete Fields */}
      <View style={styles.goingToContainer}>
        
        {/* -------- FROM Field -------- */}
        {!destinationSelected && (
          <GooglePlacesAutocomplete
            placeholder="From..."
            nearbyPlacesAPI="places"
            listViewDisplayed="auto"
            debounce={200}
            fetchDetails={true}
            currentLocation={false}
            currentLocationWithinRadius={2000}
            enablePoweredByContainer={false}
            minLength={2}
            autoFocus={true}
            ref={textInput1}
            styles={autoComplete}
            query={{
              key: GOOGLE_MAPS_APIKEY,
              language: 'en',
              location: `${ABBOTTABAD_COORDINATES.latitude},${ABBOTTABAD_COORDINATES.longitude}`,
              radius: 10000, // Allow search within 10km radius of Abbottabad
            }}
            onPress={(data, details = null) => {
              console.log("From Details:", details);
              dispatchOrigin({
                type: "ADD_ORIGIN",
                payload: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  address: details.formatted_address,
                  name: details.name,
                },
              });
              setDestinationSelected(true);
            }}
          />
        )}

        {/* -------- TO Field -------- */}
        {destinationSelected && location && (
          <GooglePlacesAutocomplete
            placeholder="Going To..."
            nearbyPlacesAPI="places"
            listViewDisplayed="auto"
            debounce={200}
            fetchDetails={true}
            currentLocation={true}
            currentLocationWithinRadius={2000}
            enablePoweredByContainer={false}
            minLength={2}
            autoFocus={true}
            ref={textInput2}
            styles={autoComplete}
            query={{
              key: GOOGLE_MAPS_APIKEY,
              language: 'en',
              location: `${ABBOTTABAD_COORDINATES.latitude},${ABBOTTABAD_COORDINATES.longitude}`,
              radius: 10000, // Allow search within 10km radius of Abbottabad
            }}
            onPress={async (data, details = null) => {
              console.log("To Details:", details);

              // Validate if the selected location is within Abbottabad bounds
              const isInAbbottabad = await checkIfPlaceIsInAbbottabad(
                details.geometry.location.lat,
                details.geometry.location.lng
              );

              if (!isInAbbottabad) {
                Alert.alert(
                  'Location Unavailable',
                  'We are currently not available in this area. Please try searching within Abbottabad.',
                  [{ text: 'OK' }]
                );
                return;
              }

              dispatchDestination({
                type: "ADD_DESTINATION", 
                payload: {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  address: details.formatted_address,
                  name: details.name,
                },
              });
              navigation.goBack(); // Go back to the previous screen
            }}
          />
        )}
      </View>
    </View>
  );
};

export default DestinationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  backButton: {
    position: 'absolute',
    top: 10,
    left: 8,
    zIndex: 10,
    padding: 3,
  },

  goingToContainer: {
    marginTop: 50,
  },
});

const autoComplete = {
  textInput: {
    backgroundColor: colors.grey6,
    height: 50,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 15,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.grey3,
  },
  container: {
    flex: 0,
  },
  textInputContainer: {
    flexDirection: 'row',
  },
};
