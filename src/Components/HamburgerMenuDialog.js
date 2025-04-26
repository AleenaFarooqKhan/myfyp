import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const MENU_ITEMS = [
  { label: "Home", icon: <Icon name="car" size={22} color="#333" /> },
  {
    label: "Request history",
    icon: <Icon name="history" size={22} color="#333" />,
  },
  {
    label: "Couriers",
    icon: <FontAwesome name="truck" size={22} color="#333" />,
  },
  {
    label: "City to City",
    icon: <Entypo name="globe" size={22} color="#333" />,
  },
  { label: "Freight", icon: <Feather name="truck" size={22} color="#333" /> },
  {
    label: "Notifications",
    icon: <Feather name="bell" size={22} color="#333" />,
  },
  {
    label: "Safety",
    icon: <MaterialIcons name="security" size={22} color="#333" />,
  },
  {
    label: "Settings",
    icon: <Feather name="settings" size={22} color="#333" />,
  },
  {
    label: "Help",
    icon: <Feather name="help-circle" size={22} color="#333" />,
  },
];

const HamburgerMenuDialog = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [currentRoute, setCurrentRoute] = useState("");

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("userName").then((name) => {
        setUserName(name || "User");
      });
      AsyncStorage.getItem("userRole").then((role) => {
        setUserRole(role || "");
      });
      // Get current route name
      if (navigation && navigation.getState) {
        const navState = navigation.getState();
        let routeName = "";
        if (navState && navState.routes && navState.index !== undefined) {
          const route = navState.routes[navState.index];
          routeName = route.name;
        }
        setCurrentRoute(routeName);
      }
    }
  }, [visible]);

  const handleMenuPress = (label) => {
    if (label === "Home") {
      if (currentRoute !== "HomeScreen") {
        navigation.navigate("HomeScreen");
      }
      onClose();
    }
    // Add more navigation logic for other menu items if needed
  };

  const handleModeSwitch = () => {
    if (userRole === "driver") {
      // Switch to passenger mode
      navigation.navigate("HomeScreen");
    } else {
      // Switch to driver mode
      navigation.navigate("DriverScreen");
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.dialogContainer}>
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
          {MENU_ITEMS.map((item, idx) => {
            const isHome = item.label === "Home";
            const isSelected = isHome && currentRoute === "HomeScreen";
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, isSelected && styles.menuItemSelected]}
                onPress={() => handleMenuPress(item.label)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>{item.icon}</View>
                <Text
                  style={[
                    styles.menuText,
                    isSelected && styles.menuTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.modeButton} onPress={handleModeSwitch}>
          <Text style={styles.modeButtonText}>
            {userRole === "driver" ? "Passenger mode" : "Driver mode"}
          </Text>
        </TouchableOpacity>
        <View style={styles.socialRow}>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://facebook.com")}
          >
            <FontAwesome
              name="facebook-square"
              size={32}
              color="#1877F3"
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://instagram.com")}
          >
            <FontAwesome
              name="instagram"
              size={32}
              color="#E1306C"
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  dialogContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 290,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 18,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: "flex-start",
  },
  profileSection: {
    alignItems: "flex-start",
    marginBottom: 18,
    paddingLeft: 6,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 6,
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
  modeButton: {
    backgroundColor: "#F7FF1A",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 10,
    marginBottom: 10,
  },
  modeButtonText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 17,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
  menuItemSelected: {
    backgroundColor: "#F7FF1A",
    borderRadius: 8,
  },
  menuTextSelected: {
    fontWeight: "bold",
    color: "#222",
  },
});

export default HamburgerMenuDialog;
