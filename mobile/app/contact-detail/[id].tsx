// app/(tabs)/contact-detail/[id].tsx
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { contactsApi } from '@/services/mockApi';

interface Contact {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  [key: string]: any;
}

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const loadContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await contactsApi.getById(id);
      if (!data) {
        setContact(null);
      } else {
        // normalize id/_id so the rest of the app can use either
        const normalized = { ...(data || {}), id: data._id || data.id, _id: data._id || data.id };
        setContact(normalized);
      }
    } catch (err: any) {
      console.error('loadContact error', err);
      // if server returned a message, surface it
      const msg = err?.message || 'Failed to load contact';
      Alert.alert('Error', msg);
      setContact(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        </View>
      </ThemedView>
    );
  }

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Contact not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Contact Details</ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.contactCard, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }]}>
          <View style={styles.contactHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {(contact.firstName?.[0] || '') + (contact.lastName?.[0] || '')}
              </ThemedText>
            </View>
            <View style={styles.contactNameContainer}>
              <ThemedText type="title" style={styles.contactName}>
                {contact.firstName} {contact.lastName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <IconSymbol name="phone.fill" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.infoText}>{contact.phone || contact.phoneNumber || '—'}</ThemedText>
            </View>

            {contact.address && (
              <View style={styles.infoRow}>
                <IconSymbol name="mappin.fill" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.infoText}>{contact.address}</ThemedText>
              </View>
            )}

            {/* Render any extra fields if present (non-destructive) */}
            {contact.gender && (
              <View style={styles.infoRow}>
                <IconSymbol name="person" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.infoText}>{contact.gender}</ThemedText>
              </View>
            )}
            {typeof contact.tags !== 'undefined' && Array.isArray(contact.tags) && contact.tags.length > 0 && (
              <View style={styles.infoRow}>
                <IconSymbol name="tag" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.infoText}>{contact.tags.join(', ')}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  backButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24 },
  content: { flex: 1 },
  contentContainer: { padding: 20, gap: 24 },
  contactCard: { padding: 20, borderRadius: 12 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0a7ea4', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  contactNameContainer: { flex: 1 },
  contactName: { fontSize: 24 },
  contactInfo: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 16, flex: 1 },
});
