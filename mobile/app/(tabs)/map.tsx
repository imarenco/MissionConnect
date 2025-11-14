import React, { useState, useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Contact = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    // Replace this with actual contact data
    setContacts([
      { id: "1", name: "Alice", latitude: 37.78825, longitude: -122.4324 },
      { id: "2", name: "Bob", latitude: 37.78925, longitude: -122.4224 },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {contacts.map((contact) => (
          <Marker
            key={contact.id}
            coordinate={{
              latitude: contact.latitude,
              longitude: contact.longitude,
            }}
            title={contact.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
