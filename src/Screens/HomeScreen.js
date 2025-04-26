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
} from "react-native";
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
  DrawerActions,
  useFocusEffect,
} from "@react-navigation/native";
import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width;

const MapComponent = () => {
  return (
    <View style={{ flex: 1, height: 200 }}>
      {Platform.OS === "web" ? (
        <WebView
          source={{ uri: "https://maps.google.com" }}
          style={{ flex: 1 }}
        />
      ) : (
        <MapView style={{ flex: 1 }} />
      )}
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [latlng, setLatLng] = useState(null);
  const _map = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

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

  useEffect(() => {
    const fetchLocation = async () => {
      const permissionGranted = await checkPermission();
      if (permissionGranted) {
        await getLocation();
      }
    };
    fetchLocation();
  }, []);

  // useEffect(() => {
  //   const fetchRecentSearches = async () => {
  //     try {
  //       let recent = await AsyncStorage.getItem("recentSearches");
  //       recent = recent ? JSON.parse(recent) : [];
  //       setRecentSearches(recent);
  //     } catch (e) {
  //       setRecentSearches([]);
  //     }
  //   };
  //   fetchRecentSearches();
  // }, []);
  useFocusEffect(
    React.useCallback(() => {
      const fetchRecentSearches = async () => {
        try {
          let recent = await AsyncStorage.getItem("recentSearches");
          recent = recent ? JSON.parse(recent) : [];
          setRecentSearches(recent);
        } catch (e) {
          setRecentSearches([]);
        }
      };
      fetchRecentSearches();
    }, [])
  );

  return (
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

      <ScrollView bounces={false}>
        <View style={styles.home}>
          <Text style={styles.text1}>Destress your commute</Text>

          <View style={styles.view1}>
            <View style={styles.view8}>
              <Text style={styles.text2}>Stare Out of the window</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("RequestScreen")}
              >
                <View style={styles.button1}>
                  <Text style={styles.button1Text}>Ride with us</Text>
                </View>
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

        <View>
          <FlatList
            numRows={2}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.view2}>
                  <Image style={styles.image2} source={item.image} />
                </View>
                <View>
                  <Text style={styles.title}>{item.name}</Text>
                </View>
              </View>
            )}
          />
        </View>
        <View style={styles.view3}>
          <Text style={styles.text5}> Recent Searches </Text>
          <View style={styles.view4}>
            <MaterialIcons name="access-time" size={24} color="black" />
            <Text style={{ marginLeft: 5 }}> Now </Text>
            <MaterialIcons name="expand-more" color={colors.black} size={24} />
          </View>
        </View>

        {/* Recent Searches List */}
        {recentSearches.length === 0 ? (
          <View style={styles.view5}>
            <View style={styles.view6}>
              <View style={styles.view7}>
                <Icon
                  name="map-marker"
                  type="material-community"
                  color={colors.grey1}
                  size={26}
                />
              </View>
              <View>
                <Text style={{ fontSize: 16, color: "#888" }}>
                  No recent searches
                </Text>
              </View>
            </View>
          </View>
        ) : (
          recentSearches.map((item, idx) => (
            <View style={styles.view5} key={idx}>
              <View style={styles.view6}>
                <View style={styles.view7}>
                  <Icon
                    name="map-marker"
                    type="material-community"
                    color={colors.grey1}
                    size={26}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 16, color: "black" }}>
                    From {item.from} to {item.to}
                  </Text>
                </View>
              </View>
              <View>
                <Icon name="chevron-right" color={colors.grey1} size={26} />
              </View>
            </View>
          ))
        )}
        <Text style={styles.text4} paddingTop="8">
          {" "}
          Around You
        </Text>

        <View style={{ alignItems: "center", justifyContent: "center" }}>
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

          <StatusBar barStyle="light-content" backgroundColor="#2058c0" />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: -30,
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

  image2: { height: 70, width: 149, borderRadius: 30 },

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
  card: {
    alignItems: "center",
    margin: SCREEN_WIDTH / 22,
  },

  view2: { marginBottom: 5, borderRadius: 15, backgroundColor: colors.grey6 },

  title: {
    color: colors.black,
    fontSize: 16,
  },
  view3: {
    flexDirection: "row",
    marginTop: 10,
    height: 50,
    backgroundColor: colors.grey6,
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
    borderRadius: 10, // Adjust the value as needed for more or less rounding
  },

  text3: { marginLeft: 15, fontSize: 20, color: colors.black },

  view4: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },

  view5: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 25,
    justifyContent: "space-between",
    marginHorizontal: 15,
    borderBottomColor: colors.grey4,
    borderBottomWidth: 1,
    flex: 1,
  },

  view6: {
    alignItems: "center",
    flex: 5,
    flexDirection: "row",
  },
  view7: {
    backgroundColor: colors.grey6,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },

  map: {
    height: 150,
    marginVertical: 0,
    width: SCREEN_WIDTH * 0.92,
  },

  text4: {
    fontSize: 20,
    color: colors.black,
    marginLeft: 20,
    marginBottom: 20,
  },

  icon1: { marginLeft: 10, paddingLeft: 1, marginTop: 5 },

  view8: { flex: 4, marginTop: -25 },
  carsAround: {
    width: 28,
    height: 14,
  },

  text5: { marginLeft: 10, fontSize: 20, color: colors.black },

  location: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  view9: { width: 4, height: 4, borderRadius: 2, backgroundColor: "white" },
});
