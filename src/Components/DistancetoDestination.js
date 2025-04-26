import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { GOOGLE_MAPS_APIKEY } from "@env";

const DistancetoDestination = ({ fromLat, fromLng, toLat, toLng }) => {
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDistance = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.rows || !data.rows[0] || !data.rows[0].elements[0]) {
        setError("No route found.");
        setLoading(false);
        return;
      }

      const element = data.rows[0].elements[0];

      if (element.status === "OK") {
        setDistance(element.distance.text);
        setDuration(element.duration.text);
        // Log the distance and duration information
        console.log("Route Information:");
        console.log("Distance:", element.distance.text);
        console.log("Duration:", element.duration.text);
        console.log("From:", `(${fromLat}, ${fromLng})`);
        console.log("To:", `(${toLat}, ${toLng})`);
      } else {
        setError("No route found.");
      }
    } catch (error) {
      setError("Error fetching distance");
      console.error("Error fetching distance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromLat && fromLng && toLat && toLng) {
      getDistance();
    }
  }, [fromLat, fromLng, toLat, toLng]);

  if (loading) return null;
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!distance || !duration) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🛣️ {distance} ⏱️ {duration}
      </Text>
    </View>
  );
};

export default DistancetoDestination;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#eaf3fa",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "center",
    minWidth: 160,
  },
  text: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  errorContainer: {
    marginVertical: 8,
    alignSelf: "center",
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: 6,
  },
  errorText: {
    color: "#c00",
    fontSize: 13,
  },
});
