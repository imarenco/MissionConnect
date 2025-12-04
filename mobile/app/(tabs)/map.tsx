import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, Contact } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Only import map libraries for native platforms
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    Callout = RNMaps.Callout;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

export default function MapScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 40.2338,
    longitude: -111.6585,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsApi.getAll();
      
      // First, try to geocode all contacts that have addresses but no coordinates
      console.log('📍 Checking if coordinates need to be generated...');
      
      // Filter contacts with location data (geocoded addresses)
      let contactsWithLocation = data.filter(c => c.lat && c.lng);
      
      // If we have contacts with addresses but no coordinates, geocode them
      const contactsNeedingGeocode = data.filter(c => c.address && (!c.lat || !c.lng));
      if (contactsNeedingGeocode.length > 0) {
        console.log(`⚠️  Found ${contactsNeedingGeocode.length} contacts with addresses but no coordinates`);
        console.log('📍 Triggering server geocoding endpoint...');
        
        // Call the server to geocode all contacts
        try {
          const response = await fetch('http://localhost:3001/api/contacts/geocode/all', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getAuthToken()}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Server geocoded ${result.geocodedCount} contacts`);
            
            // Reload contacts after geocoding
            const updatedData = await contactsApi.getAll();
            contactsWithLocation = updatedData.filter(c => c.lat && c.lng);
          }
        } catch (geocodeError) {
          console.error('Error calling geocode endpoint:', geocodeError);
          // Continue anyway with what we have
        }
      }
      
      setContacts(contactsWithLocation);
      
      console.log('📍 Loaded contacts with location:', contactsWithLocation.length);
      
      // Calculate region to fit all markers
      if (contactsWithLocation.length > 0) {
        const lats = contactsWithLocation.map(c => c.lat || 0).filter(lat => lat !== 0);
        const lngs = contactsWithLocation.map(c => c.lng || 0).filter(lng => lng !== 0);
        
        if (lats.length > 0 && lngs.length > 0) {
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          const latitude = (minLat + maxLat) / 2;
          const longitude = (minLng + maxLng) / 2;
          const latitudeDelta = (maxLat - minLat) * 1.3;
          const longitudeDelta = (maxLng - minLng) * 1.3;
          
          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: latitudeDelta > 0.0922 ? latitudeDelta : 0.0922,
            longitudeDelta: longitudeDelta > 0.0421 ? longitudeDelta : 0.0421,
          });
          
          console.log('📍 Map region calculated:', { latitude, longitude });
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts from server');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get auth token
  const getAuthToken = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('@missionconnect:token') || '';
    } catch (error) {
      return '';
    }
  };

  // Build Leaflet map HTML with markers for all contacts (FREE - no API key)
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { height: 100vh; width: 100vw; }
        #map { height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        const contacts = ${JSON.stringify(contacts)};
        const contactMarkers = [];

        contacts.forEach(contact => {
          if (contact.lat && contact.lng) {
            const marker = L.marker([contact.lat, contact.lng])
              .bindPopup(\`
                <div style="font-family: Arial; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; color: #007AFF;">\${contact.firstName} \${contact.lastName}</h3>
                  <p style="margin: 4px 0; color: #666;"><strong>Phone:</strong> \${contact.phoneNumber || contact.phone || 'N/A'}</p>
                  <p style="margin: 4px 0; color: #666;"><strong>Address:</strong> \${contact.address || 'N/A'}</p>
                </div>
              \`)
              .addTo(map);
            contactMarkers.push(marker);
          }
        });

        // Fit all markers in view
        if (contactMarkers.length > 0) {
          const group = new L.featureGroup(contactMarkers);
          map.fitBounds(group.getBounds().pad(0.1));
        }
      </script>
    </body>
    </html>
  `;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText>Loading map...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (contacts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.headerWeb}>
          <ThemedText type="title" style={styles.titleWeb}>
            Contacts Map
          </ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <IconSymbol name="location.slash" size={48} color={Colors[colorScheme ?? 'light'].icon} />
          <ThemedText style={styles.emptyText}>
            No contacts with location data yet
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Addresses are being processed to show on the map...
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Refresh the page in a moment
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* WEB VERSION → Leaflet Map with Header (FREE, no API key needed) */}
      {Platform.OS === 'web' ? (
        <>
          <View style={styles.headerWeb}>
            <ThemedText type="title" style={styles.titleWeb}>
              Contacts Map
            </ThemedText>
          </View>
          <iframe
            srcDoc={mapHTML}
            style={{
              width: '100%',
              height: 'calc(100vh - 120px)',
              border: '0',
              borderRadius: '0px',
            } as any}
            allowFullScreen
          />
        </>
      ) : MapView ? (
        // MOBILE VERSION WITH NATIVE MAPVIEW
        <>
          <View style={styles.headerWeb}>
            <ThemedText type="title" style={styles.titleWeb}>
              Contacts Map
            </ThemedText>
          </View>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {contacts.map((contact) => (
              contact.lat && contact.lng && (
                <Marker
                  key={contact.id || contact._id}
                  coordinate={{
                    latitude: contact.lat,
                    longitude: contact.lng,
                  }}
                  title={`${contact.firstName} ${contact.lastName}`}
                  description={contact.address || 'No address'}
                >
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <ThemedText type="defaultSemiBold" style={styles.calloutTitle}>
                        {contact.firstName} {contact.lastName}
                      </ThemedText>
                      <ThemedText style={styles.calloutText}>
                        {contact.phoneNumber || contact.phone}
                      </ThemedText>
                      <ThemedText style={styles.calloutText}>
                        {contact.address}
                      </ThemedText>
                    </View>
                  </Callout>
                </Marker>
              )
            ))}
          </MapView>
        </>
      ) : (
        // FALLBACK: List view
        <>
          <View style={styles.headerWeb}>
            <ThemedText type="title" style={styles.titleWeb}>
              Contacts Map
            </ThemedText>
          </View>
          <ScrollView style={styles.listContainer}>
            {contacts.map((contact) => (
              (contact.lat && contact.lng) && (
                <View
                  key={contact.id || contact._id}
                  style={styles.contactCard}
                >
                  <View style={styles.contactCardContent}>
                    <View style={styles.contactHeader}>
                      <View style={styles.locationPin}>
                        <IconSymbol name="location.fill" size={16} color="#fff" />
                      </View>
                      <ThemedText type="defaultSemiBold" style={styles.contactName}>
                        {contact.firstName} {contact.lastName}
                      </ThemedText>
                    </View>
                    <View style={styles.contactDetails}>
                      <View style={styles.detailRow}>
                        <IconSymbol name="phone.fill" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                        <ThemedText style={styles.detailText}>
                          {contact.phoneNumber || contact.phone || 'No phone'}
                        </ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <IconSymbol name="location.fill" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                        <ThemedText style={styles.detailText}>
                          {contact.address || 'No address'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              )
            ))}
          </ScrollView>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerWeb: {
    padding: 20,
    paddingTop: 16,
  },
  titleWeb: {
    fontSize: 24,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  contactCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactCardContent: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  locationPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    flex: 1,
  },
  contactDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    opacity: 0.7,
    flex: 1,
  },
  calloutContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 14,
  },
});
