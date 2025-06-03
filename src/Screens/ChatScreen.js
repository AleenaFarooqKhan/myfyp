import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import io from "socket.io-client";
import axios from "axios";

// Connect to your backend server via socket
const socket = io("http://192.168.100.168:8000"); // <-- Replace IP if needed

const userMap = {
  driver123: "Ali",
  passenger456: "Aimen",
  // Add more users if needed
};

const ChatScreen = ({ route, navigation }) => {
  const { currentUser, otherUser } = route.params || {};

  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!currentUser || !otherUser) {
      console.warn(
        "Missing route params for ChatScreen. currentUser:",
        currentUser,
        "otherUser:",
        otherUser
      );
      // Optional: navigate back or to error screen if IDs not loaded
      // navigation.goBack();
      return;
    }

    fetchMessages();

    const handleReceiveMessage = (msg) => {
      if (
        (msg.sender === currentUser && msg.receiver === otherUser) ||
        (msg.sender === otherUser && msg.receiver === currentUser)
      ) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUser, otherUser]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://192.168.100.168:8000/api/messages/${currentUser}/${otherUser}`
      );
      setChatMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!currentUser || !otherUser) {
      console.warn("Cannot send message: Missing sender or receiver ID.");
      return;
    }

    const newMessage = {
      sender: currentUser,
      receiver: otherUser,
      message,
    };

    socket.emit("sendMessage", newMessage);
    setMessage("");
    setChatMessages((prev) => [...prev, { ...newMessage, createdAt: new Date() }]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatMessages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          const time = new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const username = userMap[item.sender] || item.sender;

          return (
            <View
              style={[
                styles.messageBubble,
                item.sender === currentUser
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
              <Text style={styles.username}>{username}</Text>
              <Text>{item.message}</Text>
              <Text style={styles.timestamp}>{time}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          editable={!!currentUser && !!otherUser}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!currentUser || !otherUser}
        >
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: "blue",
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 1,
  },
  messageBubble: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: "gray",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});

export default ChatScreen;
