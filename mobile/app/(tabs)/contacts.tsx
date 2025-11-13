import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, Contact } from '@/services/mockApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  const loadContacts = useCallback(async () => {
    try {
      const data = await contactsApi.getAll();
      // normalize to have ._id and .id aliases
      const normalized = (data || []).map((c: any) => ({
        ...c,
        id: c._id || c.id,
        _id: c._id || c.id,
      }));
      setContacts(normalized);
      setFilteredContacts(normalized);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contacts');
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          (contact.firstName || '').toLowerCase().includes(q) ||
          (contact.lastName || '').toLowerCase().includes(q) ||
          `${contact.firstName || ''} ${contact.lastName || ''}`.toLowerCase().includes(q)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleDelete = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await contactsApi.delete(contact._id || contact.id);
              await loadContacts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        {
          backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
        },
      ]}
      onPress={() => router.push(`/contact-detail/${item._id || item.id}`)}>
      <View style={styles.contactInfo}>
        <ThemedText type="defaultSemiBold" style={styles.contactName}>
          {item.firstName} {item.lastName}
        </ThemedText>
        <ThemedText style={styles.contactPhone}>{item.phone || item.phoneNumber}</ThemedText>
        <ThemedText style={styles.contactAddress}>{item.address}</ThemedText>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}>
        <IconSymbol name="trash" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Contacts
        </ThemedText>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
          },
        ]}>
        <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme ?? 'light'].icon} />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: Colors[colorScheme ?? 'light'].text,
            },
          ]}
          placeholder="Search by name..."
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Colors[colorScheme ?? 'light'].icon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {searchQuery ? 'No contacts found' : 'No contacts yet. Add your first contact!'}
            </ThemedText>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => router.push('/create-contact')}>
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    marginBottom: 2,
    opacity: 0.7,
  },
  contactAddress: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
