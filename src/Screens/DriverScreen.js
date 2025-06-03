// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
// } from "react-native";
// import { colors, parameters } from "../Global/Styles";
// import { StatusBar } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useNavigation } from "@react-navigation/native";
// import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";
// import * as Location from "expo-location";
// import axios from "axios";

// const SCREEN_WIDTH = Dimensions.get("window").width;

// const fillerData = [
//   { id: "1", name: "Offer Now", image: require("../../assets/BookNow.png") },
//   { id: "2", name: "Reserve", image: require("../../assets/Reserve.png") },
// ];

// const DriverScreen = () => {
//   const navigation = useNavigation();
//   const [latlng, setLatLng] = useState(null);
//   const [carpoolOffers, setCarpoolOffers] = useState([]);
//   const _map = useRef(null);
//   const [menuVisible, setMenuVisible] = useState(false);

//   const checkPermission = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     return status === "granted";
//   };

//   const getLocation = async () => {
//     try {
//       const { granted } = await Location.requestForegroundPermissionsAsync();
//       if (!granted) return;

//       const {
//         coords: { latitude, longitude },
//       } = await Location.getCurrentPositionAsync();
//       setLatLng({ latitude, longitude });
//     } catch (err) {
//       console.error("Error fetching location:", err);
//     }
//   };

//   useEffect(() => {
//     const fetchLocation = async () => {
//       const permissionGranted = await checkPermission();
//       if (permissionGranted) {
//         await getLocation();
//       }
//     };
//     fetchLocation();

//     // Fetch carpool offers from backend API
//     const loadCarpoolOffers = async () => {
//       try {
//         const response = await axios.get("http://192.168.100.9:3000/api/carpool/available");
//         setCarpoolOffers(response.data);
//       } catch (error) {
//         console.error("Error loading carpool offers:", error);
//       }
//     };
//     loadCarpoolOffers();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.icon1}>
//           <TouchableOpacity onPress={() => setMenuVisible(true)}>
//             <Icon name="menu" color={colors.white} size={40} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <HamburgerMenuDialog
//         visible={menuVisible}
//         onClose={() => setMenuVisible(false)}
//       />

//       <ScrollView bounces={false}>
//         <View style={styles.home}>
//           <Text style={styles.text1}>Offer carpool and share your expense</Text>

//           <View style={styles.view1}>
//             <Text style={styles.text2}>Join people along the route</Text>
//             <View style={styles.view8}></View>
//             <View>
//               <Image
//                 style={styles.image1}
//                 source={require("../../assets/car.png")}
//               />
//             </View>
//           </View>
//         </View>

//         <View>
//           <FlatList
//             numRows={2}
//             horizontal={true}
//             showsHorizontalScrollIndicator={false}
//             data={fillerData}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.card}
//                 onPress={() => {
//                   if (item.name === "Offer Now") {
//                     navigation.navigate("OfferingCarpool");
//                   } else if (item.name === "Reserve") {
//                     navigation.navigate("ReservingCarpool");
//                   }
//                 }}
//               >
//                 <View style={styles.view2}>
//                   <Image style={styles.image2} source={item.image} />
//                 </View>
//                 <View>
//                   <Text style={styles.title}>{item.name}</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* Carpool Offers Section */}
//         <View style={styles.historySection}>
//           <Text style={styles.historyTitle}>Carpool Offers</Text>
//           {carpoolOffers.length > 0 ? (
//             carpoolOffers.map((offer, index) => (
//               <View key={index} style={styles.historyItem}>
//                 <Text style={styles.historyText}>
//                   From: {offer.from} | To: {offer.to}
//                 </Text>
//                 <Text style={styles.historySubText}>
//                   Date: {offer.date} | Time: {offer.time}
//                 </Text>
//                 {offer.via && (
//                   <Text style={styles.historySubText}>Via: {offer.via}</Text>
//                 )}
//                 <Text style={styles.historySubText}>
//                   Seats: {offer.seats} | Fare: RS:{offer.fare}
//                 </Text>
//               </View>
//             ))
//           ) : (
//             <View style={styles.historyItem}>
//               <Text style={styles.historyText}>No carpool offers yet</Text>
//             </View>
//           )}
//         </View>

//         <StatusBar barStyle="light-content" backgroundColor="#2058c0" />
//       </ScrollView>
//     </View>
//   );
// };

// export default DriverScreen;

// // === Add your styles here ===
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   header: {
//     backgroundColor: colors.blue,
//     height: parameters.headerHeight,
//     alignItems: "flex-start",
//   },
//   icon1: {
//     marginLeft: 20,
//     marginTop: 15,
//   },
//   home: {
//     backgroundColor: colors.blue,
//     paddingBottom: 30,
//   },
//   text1: {
//     color: colors.white,
//     fontSize: 21,
//     paddingHorizontal: 20,
//     marginTop: 10,
//     fontWeight: "bold",
//   },
//   text2: {
//     color: colors.white,
//     fontSize: 16,
//     paddingHorizontal: 20,
//     marginBottom: 10,
//   },
//   view1: {
//     flexDirection: "row",
//     marginTop: 10,
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//   },
//   view8: {
//     width: 10,
//   },
//   image1: {
//     height: 60,
//     width: 60,
//   },
//   card: {
//     backgroundColor: colors.grey5,
//     borderRadius: 10,
//     marginHorizontal: 10,
//     alignItems: "center",
//     padding: 10,
//     elevation: 5,
//   },
//   view2: {
//     marginBottom: 5,
//   },
//   image2: {
//     width: 100,
//     height: 100,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: colors.grey1,
//   },
//   historySection: {
//     paddingHorizontal: 20,
//     marginTop: 20,
//   },
//   historyTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: colors.black,
//   },
//   historyItem: {
//     backgroundColor: colors.grey4,
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   historyText: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   historySubText: {
//     fontSize: 14,
//     color: colors.grey1,
//   },
// });








// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   ActivityIndicator,
//   RefreshControl
// } from "react-native";
// import { colors, parameters } from "../Global/Styles";
// import { StatusBar } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useNavigation } from "@react-navigation/native";
// import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";
// import * as Location from "expo-location";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const SCREEN_WIDTH = Dimensions.get("window").width;

// const fillerData = [
//   { id: "1", name: "Offer Now", image: require("../../assets/BookNow.png") },
//   { id: "2", name: "Reserve", image: require("../../assets/Reserve.png") },
// ];

// const DriverScreen = () => {
//   const navigation = useNavigation();
//   const [latlng, setLatLng] = useState(null);
//   const [carpoolOffers, setCarpoolOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const _map = useRef(null);
//   const [menuVisible, setMenuVisible] = useState(false);

//   const fetchCarpoolOffers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const response = await axios.get(
//         "http://192.168.1.9:3000/api/carpool/available",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data && Array.isArray(response.data)) {
//         setCarpoolOffers(response.data);
//       } else {
//         throw new Error("Invalid data format received");
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.response?.data?.message || err.message || "Failed to load offers");
      
//       if (err.response?.status === 401) {
//         Alert.alert(
//           "Session Expired",
//           "Please login again",
//           [{ text: "OK", onPress: () => navigation.navigate("LoginAsDriver") }]
//         );
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchCarpoolOffers();
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchCarpoolOffers();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   useEffect(() => {
//     fetchCarpoolOffers();
//   }, []);

//   const checkPermission = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     return status === "granted";
//   };

//   const getLocation = async () => {
//     try {
//       const { granted } = await Location.requestForegroundPermissionsAsync();
//       if (!granted) return;

//       const {
//         coords: { latitude, longitude },
//       } = await Location.getCurrentPositionAsync();
//       setLatLng({ latitude, longitude });
//     } catch (err) {
//       console.error("Location error:", err);
//     }
//   };

//   const renderOfferItem = ({ item }) => (
//     <View style={styles.historyItem}>
//       <View style={styles.offerHeader}>
//         <Text style={styles.driverName}>{item.driverName}</Text>
//         <Text style={styles.offerTime}>
//           {new Date(item.departureTime).toLocaleString()}
//         </Text>
//       </View>
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker" size={20} color="#FF3B30" />
//         <Text style={styles.routeText}>{item.startLocation}</Text>
//       </View>
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker-check" size={20} color="#4CD964" />
//         <Text style={styles.routeText}>{item.endLocation}</Text>
//       </View>
//       {item.viaRoute && (
//         <View style={styles.routeContainer}>
//           <Icon name="map-marker-path" size={20} color="#007AFF" />
//           <Text style={styles.routeText}>Via: {item.viaRoute}</Text>
//         </View>
//       )}
//       <View style={styles.offerFooter}>
//         <Text style={styles.seatsText}>
//           <Icon name="account" size={16} /> {item.seatsAvailable} seats
//         </Text>
//         <Text style={styles.fareText}>
//           <Icon name="cash" size={16} /> Rs. {item.farePerSeat}/seat
//         </Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.icon1}>
//           <TouchableOpacity onPress={() => setMenuVisible(true)}>
//             <Icon name="menu" color={colors.white} size={40} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <HamburgerMenuDialog
//         visible={menuVisible}
//         onClose={() => setMenuVisible(false)}
//       />

//       <ScrollView 
//         bounces={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.blue]}
//           />
//         }
//       >
//         <View style={styles.home}>
//           <Text style={styles.text1}>Offer carpool and share your expense</Text>

//           <View style={styles.view1}>
//             <Text style={styles.text2}>Join people along the route</Text>
//             <View style={styles.view8}></View>
//             <View>
//               <Image
//                 style={styles.image1}
//                 source={require("../../assets/car.png")}
//               />
//             </View>
//           </View>
//         </View>

//         <View>
//           <FlatList
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             data={fillerData}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.card}
//                 onPress={() => {
//                   if (item.name === "Offer Now") {
//                     navigation.navigate("OfferingCarpool");
//                   } else if (item.name === "Reserve") {
//                     navigation.navigate("ReservingCarpool");
//                   }
//                 }}
//               >
//                 <View style={styles.view2}>
//                   <Image style={styles.image2} source={item.image} />
//                 </View>
//                 <View>
//                   <Text style={styles.title}>{item.name}</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           />
//         </View>

//         {/* Carpool Offers Section */}
//         <View style={styles.historySection}>
//           <Text style={styles.historyTitle}>Available Carpools</Text>
          
//           {loading ? (
//             <ActivityIndicator size="large" color={colors.blue} style={styles.loader} />
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{error}</Text>
//               <TouchableOpacity 
//                 style={styles.retryButton}
//                 onPress={fetchCarpoolOffers}
//               >
//                 <Text style={styles.retryButtonText}>Try Again</Text>
//               </TouchableOpacity>
//             </View>
//           ) : carpoolOffers.length > 0 ? (
//             <FlatList
//               data={carpoolOffers}
//               keyExtractor={(item) => item._id || Math.random().toString()}
//               renderItem={renderOfferItem}
//               scrollEnabled={false}
//             />
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Icon name="car-off" size={50} color={colors.grey3} />
//               <Text style={styles.emptyText}>No carpool offers available</Text>
//               <TouchableOpacity 
//                 style={styles.offerButton}
//                 onPress={() => navigation.navigate("OfferingCarpool")}
//               >
//                 <Text style={styles.offerButtonText}>Create Offer</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         <StatusBar barStyle="light-content" backgroundColor="#2058c0" />
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   header: {
//     backgroundColor: colors.blue,
//     height: parameters.headerHeight,
//     alignItems: "flex-start",
//   },
//   icon1: {
//     marginLeft: 20,
//     marginTop: 15,
//   },
//   home: {
//     backgroundColor: colors.blue,
//     paddingBottom: 30,
//   },
//   text1: {
//     color: colors.white,
//     fontSize: 21,
//     paddingHorizontal: 20,
//     marginTop: 10,
//     fontWeight: "bold",
//   },
//   text2: {
//     color: colors.white,
//     fontSize: 16,
//     paddingHorizontal: 20,
//     marginBottom: 10,
//   },
//   view1: {
//     flexDirection: "row",
//     marginTop: 10,
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//   },
//   view8: {
//     width: 10,
//   },
//   image1: {
//     height: 60,
//     width: 60,
//   },
//   card: {
//     backgroundColor: colors.grey5,
//     borderRadius: 10,
//     marginHorizontal: 10,
//     alignItems: "center",
//     padding: 10,
//     elevation: 5,
//     width: SCREEN_WIDTH * 0.45,
//   },
//   view2: {
//     marginBottom: 5,
//   },
//   image2: {
//     width: 100,
//     height: 100,
//     resizeMode: "contain",
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: colors.grey1,
//   },
//   historySection: {
//     paddingHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 30,
//   },
//   historyTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//     color: colors.black,
//   },
//   historyItem: {
//     backgroundColor: colors.white,
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 3,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.blue,
//   },
//   offerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: colors.black,
//   },
//   offerTime: {
//     fontSize: 14,
//     color: colors.grey2,
//   },
//   routeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 4,
//   },
//   routeText: {
//     fontSize: 15,
//     marginLeft: 8,
//     color: colors.grey1,
//   },
//   offerFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: colors.grey4,
//   },
//   seatsText: {
//     color: colors.grey1,
//     fontSize: 14,
//   },
//   fareText: {
//     color: colors.blue,
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   loader: {
//     marginVertical: 30,
//   },
//   errorContainer: {
//     alignItems: "center",
//     paddingVertical: 20,
//   },
//   errorText: {
//     color: colors.red,
//     fontSize: 16,
//     textAlign: "center",
//     marginBottom: 15,
//   },
//   retryButton: {
//     backgroundColor: colors.blue,
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: colors.white,
//     fontWeight: "bold",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   emptyText: {
//     color: colors.grey2,
//     fontSize: 16,
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   offerButton: {
//     backgroundColor: colors.blue,
//     paddingVertical: 12,
//     paddingHorizontal: 30,
//     borderRadius: 5,
//   },
//   offerButtonText: {
//     color: colors.white,
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default DriverScreen; 

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   Dimensions,
//   ActivityIndicator,
//   RefreshControl,
//   Alert
// } from "react-native";
// import { colors, parameters } from "../Global/Styles";
// import { StatusBar } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useNavigation } from "@react-navigation/native";
// import HamburgerMenuDialog from "../Components/HamburgerMenuDialog";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// const SCREEN_WIDTH = Dimensions.get("window").width;

// const DriverScreen = () => {
//   const navigation = useNavigation();
//   const [carpoolOffers, setCarpoolOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [menuVisible, setMenuVisible] = useState(false);

//   const fetchCarpoolOffers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const response = await axios.get(
//         "http://192.168.1.9:3000/api/carpool/available",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       // Validate response format
//       if (response.data && Array.isArray(response.data.carpools)) {
//         const formattedOffers = response.data.carpools.map(offer => ({
//           id: offer._id,
//           driverName: offer.driverName,
//           startLocation: offer.startLocation,
//           endLocation: offer.endLocation,
//           viaRoute: offer.viaRoute || "",
//           seatsAvailable: offer.seatsAvailable,
//           farePerSeat: offer.farePerSeat,
//           departureTime: new Date(offer.departureTime).toLocaleString(),
//           date: new Date(offer.departureTime).toLocaleDateString(),
//           time: new Date(offer.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         }));
        
//         setCarpoolOffers(formattedOffers);
//       } else {
//         throw new Error("Invalid data format received from server");
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.response?.data?.message || err.message || "Failed to load offers");
      
//       if (err.response?.status === 401) {
//         Alert.alert(
//           "Session Expired",
//           "Please login again",
//           [{ text: "OK", onPress: () => navigation.navigate("LoginAsDriver") }]
//         );
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', fetchCarpoolOffers);
//     return unsubscribe;
//   }, [navigation]);

//   useEffect(() => {
//     fetchCarpoolOffers();
//   }, []);

//   const renderOfferItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.offerCard}
//       onPress={() => navigation.navigate("CarpoolDetails", { carpoolId: item.id })}
//     >
//       <View style={styles.offerHeader}>
//         <Text style={styles.driverName}>{item.driverName}</Text>
//         <Text style={styles.offerTime}>{item.time}</Text>
//       </View>
      
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker" size={18} color="#FF3B30" />
//         <Text style={styles.routeText}>{item.startLocation}</Text>
//       </View>
      
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker-check" size={18} color="#4CD964" />
//         <Text style={styles.routeText}>{item.endLocation}</Text>
//       </View>
      
//       {item.viaRoute && (
//         <View style={styles.routeContainer}>
//           <Icon name="map-marker-path" size={18} color="#007AFF" />
//           <Text style={styles.routeText}>Via: {item.viaRoute}</Text>
//         </View>
//       )}
      
//       <View style={styles.offerFooter}>
//         <Text style={styles.seatsText}>
//           <Icon name="account" size={14} /> {item.seatsAvailable} seats available
//         </Text>
//         <Text style={styles.fareText}>
//           <Icon name="cash" size={14} /> Rs. {item.farePerSeat} per seat
//         </Text>
//       </View>
      
//       <Text style={styles.dateText}>{item.date}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor={colors.blue} />
      
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.menuButton}
//           onPress={() => setMenuVisible(true)}
//         >
//           <Icon name="menu" color={colors.white} size={32} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Carpool Offers</Text>
//       </View>

//       <HamburgerMenuDialog
//         visible={menuVisible}
//         onClose={() => setMenuVisible(false)}
//       />

//       <ScrollView
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={fetchCarpoolOffers}
//             colors={[colors.blue]}
//           />
//         }
//       >
//         {loading ? (
//           <ActivityIndicator size="large" color={colors.blue} style={styles.loader} />
//         ) : error ? (
//           <View style={styles.errorContainer}>
//             <Icon name="alert-circle" size={40} color={colors.grey2} />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity
//               style={styles.retryButton}
//               onPress={fetchCarpoolOffers}
//             >
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : carpoolOffers.length > 0 ? (
//           <FlatList
//             data={carpoolOffers}
//             keyExtractor={(item) => item.id}
//             renderItem={renderOfferItem}
//             scrollEnabled={false}
//             contentContainerStyle={styles.offersList}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Icon name="car-off" size={50} color={colors.grey2} />
//             <Text style={styles.emptyText}>No carpool offers available</Text>
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={() => navigation.navigate("OfferingCarpool")}
//             >
//               <Text style={styles.createButtonText}>Create New Offer</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   header: {
//     backgroundColor: colors.blue,
//     height: parameters.headerHeight,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     elevation: 4,
//   },
//   menuButton: {
//     marginRight: 15,
//   },
//   headerTitle: {
//     color: colors.white,
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   loader: {
//     marginTop: 50,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     padding: 30,
//   },
//   errorText: {
//     color: colors.grey1,
//     fontSize: 16,
//     marginVertical: 15,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: colors.blue,
//     paddingHorizontal: 25,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: colors.white,
//     fontWeight: 'bold',
//   },
//   offersList: {
//     padding: 15,
//   },
//   offerCard: {
//     backgroundColor: colors.white,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 2,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.blue,
//   },
//   offerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: colors.black,
//   },
//   offerTime: {
//     fontSize: 14,
//     color: colors.blue,
//     fontWeight: '500',
//   },
//   routeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   routeText: {
//     fontSize: 15,
//     marginLeft: 8,
//     color: colors.grey1,
//   },
//   offerFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: colors.grey4,
//   },
//   seatsText: {
//     color: colors.grey1,
//     fontSize: 14,
//   },
//   fareText: {
//     color: colors.blue,
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   dateText: {
//     color: colors.grey2,
//     fontSize: 13,
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     color: colors.grey2,
//     fontSize: 16,
//     marginVertical: 15,
//     textAlign: 'center',
//   },
//   createButton: {
//     backgroundColor: colors.blue,
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 5,
//     marginTop: 10,
//   },
//   createButtonText: {
//     color: colors.white,
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default DriverScreen; 

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Alert
// } from "react-native";
// import { colors, parameters } from "../Global/Styles";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// const DriverScreen = () => {
//   const navigation = useNavigation();
//   const [carpoolOffers, setCarpoolOffers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchCarpoolOffers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         throw new Error("Authentication required");
//       }

//       const response = await axios.get(
//         "http://192.168.1.9:3000/api/carpool/available",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data && Array.isArray(response.data.carpools)) {
//         const formattedOffers = response.data.carpools.map(offer => ({
//           id: offer._id,
//           driverName: offer.driverName,
//           startLocation: offer.startLocation,
//           endLocation: offer.endLocation,
//           viaRoute: offer.viaRoute || "",
//           seatsAvailable: offer.seatsAvailable,
//           farePerSeat: offer.farePerSeat,
//           departureTime: new Date(offer.departureTime).toLocaleString(),
//           date: new Date(offer.departureTime).toLocaleDateString(),
//           time: new Date(offer.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         }));
        
//         setCarpoolOffers(formattedOffers);
//       } else {
//         throw new Error("Invalid data format received from server");
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.response?.data?.message || err.message || "Failed to load offers");
      
//       if (err.response?.status === 401) {
//         Alert.alert(
//           "Session Expired",
//           "Please login again",
//           [{ text: "OK", onPress: () => navigation.navigate("LoginAsDriver") }]
//         );
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', fetchCarpoolOffers);
//     return unsubscribe;
//   }, [navigation]);

//   const renderOfferItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.offerCard}
//       onPress={() => navigation.navigate("CarpoolDetails", { carpoolId: item.id })}
//     >
//       <View style={styles.offerHeader}>
//         <Text style={styles.driverName}>{item.driverName}</Text>
//         <Text style={styles.offerTime}>{item.time}</Text>
//       </View>
      
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker" size={18} color="#FF3B30" />
//         <Text style={styles.routeText}>{item.startLocation}</Text>
//       </View>
      
//       <View style={styles.routeContainer}>
//         <Icon name="map-marker-check" size={18} color="#4CD964" />
//         <Text style={styles.routeText}>{item.endLocation}</Text>
//       </View>
      
//       {item.viaRoute && (
//         <View style={styles.routeContainer}>
//           <Icon name="map-marker-path" size={18} color="#007AFF" />
//           <Text style={styles.routeText}>Via: {item.viaRoute}</Text>
//         </View>
//       )}
      
//       <View style={styles.offerFooter}>
//         <Text style={styles.seatsText}>
//           <Icon name="account" size={14} /> {item.seatsAvailable} seats available
//         </Text>
//         <Text style={styles.fareText}>
//           <Icon name="cash" size={14} /> Rs. {item.farePerSeat} per seat
//         </Text>
//       </View>
      
//       <Text style={styles.dateText}>{item.date}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon name="arrow-left" color={colors.white} size={28} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Available Carpools</Text>
//       </View>

//       <ScrollView
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={fetchCarpoolOffers}
//             colors={[colors.blue]}
//           />
//         }
//       >
//         {loading ? (
//           <ActivityIndicator size="large" color={colors.blue} style={styles.loader} />
//         ) : error ? (
//           <View style={styles.errorContainer}>
//             <Icon name="alert-circle" size={40} color={colors.grey2} />
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity
//               style={styles.retryButton}
//               onPress={fetchCarpoolOffers}
//             >
//               <Text style={styles.retryButtonText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         ) : carpoolOffers.length > 0 ? (
//           <FlatList
//             data={carpoolOffers}
//             keyExtractor={(item) => item.id}
//             renderItem={renderOfferItem}
//             scrollEnabled={false}
//             contentContainerStyle={styles.offersList}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Icon name="car-off" size={50} color={colors.grey2} />
//             <Text style={styles.emptyText}>No carpool offers available</Text>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   header: {
//     backgroundColor: colors.blue,
//     height: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     elevation: 4,
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   headerTitle: {
//     color: colors.white,
//     fontSize: 20,
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: 40, // To balance the back button space
//   },
//   loader: {
//     marginTop: 50,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     padding: 30,
//   },
//   errorText: {
//     color: colors.grey1,
//     fontSize: 16,
//     marginVertical: 15,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: colors.blue,
//     paddingHorizontal: 25,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: colors.white,
//     fontWeight: 'bold',
//   },
//   offersList: {
//     padding: 15,
//   },
//   offerCard: {
//     backgroundColor: colors.white,
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 2,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.blue,
//   },
//   offerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: colors.black,
//   },
//   offerTime: {
//     fontSize: 14,
//     color: colors.blue,
//     fontWeight: '500',
//   },
//   routeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   routeText: {
//     fontSize: 15,
//     marginLeft: 8,
//     color: colors.grey1,
//   },
//   offerFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: colors.grey4,
//   },
//   seatsText: {
//     color: colors.grey1,
//     fontSize: 14,
//   },
//   fareText: {
//     color: colors.blue,
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   dateText: {
//     color: colors.grey2,
//     fontSize: 13,
//     marginTop: 8,
//     fontStyle: 'italic',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     color: colors.grey2,
//     fontSize: 16,
//     marginVertical: 15,
//     textAlign: 'center',
//   },
// });

// export default DriverScreen;










import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HamburgerMenuDialog from '../Components/HamburgerMenuDialog'; // adjust path if needed

const DriverScreen = () => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [driverId, setDriverId] = useState(null);

  useEffect(() => {
    const getDriverId = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setDriverId(parsed._id); // adjust if you used a different key like parsed.driverId
        }
      } catch (error) {
        console.error("Error loading driver data", error);
      }
    };

    getDriverId();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E90FF" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.hamburgerIcon}>
          <Feather name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Dashboard</Text>
      </View>

      {/* View Available Carpools */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AvailableCarpools')}
      >
        <Icon name="car-multiple" size={40} color="#4f46e5" />
        <Text style={styles.cardText}>View Available Carpools</Text>
      </TouchableOpacity>

      {/* Create Carpool Offer */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OfferingCarpool')}
      >
        <Icon name="plus-circle" size={40} color="#4f46e5" />
        <Text style={styles.cardText}>Create New Carpool Offer</Text>
      </TouchableOpacity>

      {/* Chat Button */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const passengerId = "6651fc95e13a05a256d56012"; // Replace with actual selected passenger ID
          if (driverId) {
            navigation.navigate("ChatScreen", {
              currentUser: driverId,
              otherUser: passengerId,
            });
          } else {
            console.log("Driver ID not loaded");
          }
        }}
      >
        <Icon name="chat" size={40} color="#4f46e5" />
        <Text style={styles.cardText}>Chat with Passenger</Text>
      </TouchableOpacity>

      {/* Hamburger Menu */}
      <HamburgerMenuDialog visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 30,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  hamburgerIcon: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
  },
  cardText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '500',
  },
});

export default DriverScreen;
