import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { height: screenHeight } = Dimensions.get("window");

// Menu items with role-based route mapping
const getMenuItems = (role) => [
  {
    label: "Home",
    route: role === "driver" ? "DriverHome" : "PassengerHome",
    icon: <Icon name="home" size={22} color="#333" />,
  },
  {
    label: "Profile",
    route: role === "driver" ? "DriverProfile" : "PassengerProfile",
    icon: <Icon name="account" size={22} color="#333" />,
  },
  {
    label: "Messages",
    route: role === "driver" ? "DriverMessages" : "PassengerMessages",
    icon: <FontAwesome name="comments" size={22} color="#333" />,
  },
  {
    label: "Notifications",
    route: role === "driver" ? "DriverNotifications" : "PassengerNotifications",
    icon: <Feather name="bell" size={22} color="#333" />,
  },
  {
    label: "Safety",
    route: role === "driver" ? "DriverSafety" : "PassengerSafety",
    icon: <MaterialIcons name="security" size={22} color="#333" />,
  },
  {
    label: "Settings",
    route: role === "driver" ? "DriverSettings" : "PassengerSettings",
    icon: <Feather name="settings" size={22} color="#333" />,
  },
  {
    label: "Help",
    route: role === "driver" ? "DriverHelp" : "PassengerHelp",
    icon: <Feather name="help-circle" size={22} color="#333" />,
  },
];

const HamburgerMenuDialog = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("userName").then((name) => setUserName(name || "User"));
      AsyncStorage.getItem("userRole").then((role) => setUserRole(role || ""));

      // Delay selection to ensure userRole is set
      setTimeout(() => {
        const navState = navigation?.getState?.();
        const currentRoute = navState?.routes?.[navState.index]?.name;
        const items = getMenuItems(userRole);
        const matchedItem = items.find((item) => item.route === currentRoute);
        setSelectedMenuItem(matchedItem?.label || "");
      }, 100);
    }
  }, [visible, userRole]);

  const handleMenuPress = (label) => {
    const items = getMenuItems(userRole);
    const item = items.find((m) => m.label === label);

    if (item && navigation) {
      const navState = navigation.getState();
      const currentRoute = navState?.routes?.[navState.index]?.name;

      if (item.route !== currentRoute) {
        navigation.navigate(item.route);
      }
      setSelectedMenuItem(item.label);
    }
    onClose();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("userName");
              await AsyncStorage.removeItem("userRole");
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: userRole === "driver" ? "LoginAsDriver" : "LoginAsPassenger",
                  },
                ],
              });
              onClose();
            } catch (error) {
              console.error("Error logging out:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const menuItems = getMenuItems(userRole);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.transparentBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.dialogContainer}>
          <TouchableOpacity
            onPress={onClose}
            style={{ position: "absolute", top: 10, left: 10 }}
          >
            <Feather name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <Image
              source={require("../../assets/profile.jpg")}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{userName}</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" color="#FFD700" size={18} />
              <Text style={styles.ratingText}>4.82</Text>
              <Text style={styles.ratingCount}>(121)</Text>
            </View>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const isSelected = item.label === selectedMenuItem;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, isSelected && styles.menuItemSelected]}
                  onPress={() => handleMenuPress(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIcon}>{item.icon}</View>
                  <Text style={[styles.menuText, isSelected && styles.menuTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modeButton}>
            <Text style={styles.modeButtonText}>
              {userRole === "driver" ? "Driver Mode" : "Passenger Mode"}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={22} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: 0,
    height: screenHeight,
    width: "100%",
    zIndex: 9999,
  },
  transparentBackground: {
    flex: 1,
  },
  dialogContainer: {
    left: -110,
    top: 28,
    height: screenHeight - 20,
    width: "70%",
    backgroundColor: "#fff",
    paddingTop: 15,
    paddingHorizontal: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "flex-start",
    marginBottom: 18,
    paddingLeft: 6,
    marginTop: 70,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginTop: -35,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "black",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 15,
    color: "#222",
    marginLeft: 4,
    fontWeight: "bold",
  },
  ratingCount: {
    fontSize: 13,
    color: "#888",
    marginLeft: 4,
  },
  menuList: {
    flex: 1,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  menuIcon: {
    width: 32,
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 10,
  },
  menuItemSelected: {
    backgroundColor: "#2196F3",
  },
  menuTextSelected: {
    fontWeight: "bold",
    color: "#fff",
  },
  modeButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 15,
    marginBottom: 20,
  },
  modeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "red",
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 3,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
});

export default HamburgerMenuDialog;
