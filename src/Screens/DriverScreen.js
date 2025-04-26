import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { colors, parameters } from "../Global/Styles";
import { StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";

const SCREEN_WIDTH = Dimensions.get("window").width;
const fillerData = [
  { id: "1", name: "Offer Now", image: require("../../assets/BookNow.png") },
  { id: "2", name: "Reserve", image: require("../../assets/Reserve.png") },
];

const DriverScreen = () => {
  const navigation = useNavigation();
  const [latlng, setLatLng] = useState(null);
  const [carpoolHistory, setCarpoolHistory] = useState([]);
  const _map = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);

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

    // Load carpool history
    const loadCarpoolHistory = async () => {
      try {
        const history = await AsyncStorage.getItem("carpoolHistory");
        if (history) {
          setCarpoolHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error("Error loading carpool history:", error);
      }
    };
    loadCarpoolHistory();
  }, []);

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
          <Text style={styles.text1}>Offer carpool and share your expense</Text>

          <View style={styles.view1}>
            <Text style={styles.text2}>Join people along the route</Text>
            <View style={styles.view8}></View>
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
            data={fillerData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  if (item.name === "Offer Now") {
                    navigation.navigate("OfferingCarpool"); // Replace with your actual screen name
                  } else if (item.name === "Reserve") {
                    navigation.navigate("ReservingCarpool"); // Replace with your actual screen name
                  }
                }}
              >
                <View style={styles.view2}>
                  <Image style={styles.image2} source={item.image} />
                </View>
                <View>
                  <Text style={styles.title}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
        {/* Carpool History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Carpool History</Text>
          {carpoolHistory.length > 0 ? (
            carpoolHistory.map((carpool, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>
                  {carpool.from} to {carpool.to}
                </Text>
                <Text style={styles.historySubText}>
                  Date: {carpool.date} | Time: {carpool.time}
                </Text>
                {carpool.via && (
                  <Text style={styles.historySubText}>Via: {carpool.via}</Text>
                )}
                <Text style={styles.historySubText}>
                  Seats: {carpool.seats} | Fare: RS:{carpool.fare}
                </Text>
                <Text style={styles.historySubText}>
                  Fare per Seats: RS: {carpool.fare / carpool.seats}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.historyItem}>
              <Text style={styles.historyText}>No carpool history yet</Text>
            </View>
          )}
        </View>

        <StatusBar barStyle="light-content" backgroundColor="#2058c0" />
      </ScrollView>
    </View>
  );
};

export default DriverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingBottom: 30,
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
  image2: {
    height: 70,
    width: 149,
    borderRadius: 30,
  },
  title: {
    color: colors.black,
    fontSize: 16,
  },
  home: {
    paddingLeft: 20,
    backgroundColor: colors.blue, // Blue background is kept for the main section
  },
  text1: {
    color: colors.white,
    fontSize: 21,
    fontFamily: "Times New Roman",
    paddingBottom: -50,
    paddingTop: -80,
  },
  text2: {
    color: colors.white,
    fontFamily: "Times New Roman",
    fontSize: 16,
    paddingBottom: -20,
  },
  view2: { marginBottom: 5, borderRadius: 15, backgroundColor: colors.white },
  view1: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 15,
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
    marginTop: 5,
  },
  card: {
    alignItems: "center",
    margin: SCREEN_WIDTH / 22,
  },
  view8: {
    flex: 4,
    marginTop: -20,
  },
  historySection: {
    marginTop: 5,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "transparent", // Transparent background for the history section
  },
  historyTitle: {
    color: colors.black,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  historyText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  historySubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
