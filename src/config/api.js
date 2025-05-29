import AsyncStorage from "@react-native-async-storage/async-storage";

// Centralized configuration
export const API_BASE_URL = "http://192.168.100.168:3000";

// Helper to get authentication headers
export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) return {};
    
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return { "Content-Type": "application/json" };
  }
};

// API request with authentication
export const authenticatedRequest = async (endpoint, method = "GET", data = null) => {
  try {
    const headers = await getAuthHeaders();
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      timeout: 10000
    };
    
    if (data && (method === "POST" || method === "PUT")) {
      config.data = data;
    }
    
    return axios(config);
  } catch (error) {
    console.error(`API request error (${endpoint}):`, error);
    throw error;
  }
};