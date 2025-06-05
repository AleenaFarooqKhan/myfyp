import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

const DriverMessages = () => {
  const [messagesResponse, setMessagesResponse] = useState([]);

  const fetchMessages = async () => {
    const id = await AsyncStorage.getItem("driverId");
    if (!id) return;

    try {
      console.log(id);
      const response = await axios.get(
        `${API_BASE_URL}/api/driver/${id}/get-messages`
      );
      setMessagesResponse(response.data.driverMessages);
    } catch (error) {
      console.log("Fetch error:", error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    console.log(messagesResponse);
  }, [messagesResponse]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages 📩</Text>

      <ScrollView style={styles.messageContainer}>
        {messagesResponse.length === 0 ? (
          <Text style={styles.noMessageText}>No messages found.</Text>
        ) : (
          messagesResponse.map((msg, index) => (
            <View key={index} style={styles.messageBox}>
              <Text style={styles.messageText}>• {msg.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  messageContainer: {
    flex: 1,
  },
  noMessageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  messageBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // for Android shadow
  },
  messageText: {
    fontSize: 16,
    color: "#444",
  },
});

export default DriverMessages;
