import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, Contact, visitsApi, Visit } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [selectedContactVisits, setSelectedContactVisits] = useState<Visit[]>([]);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [selectedContactName, setSelectedContactName] = useState('');
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
      setContacts(data);
      setFilteredContacts(data);
      // Also load visits to show counts
      const visits = await visitsApi.getAll();
      setAllVisits(visits);
    } catch {
      Alert.alert('Error', 'Failed to load contacts');
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Use useFocusEffect to reload contacts when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = async (contact: Contact) => {
    console.log('Delete button pressed for contact:', contact.firstName, contact.lastName);
    console.log('Full contact object:', JSON.stringify(contact, null, 2));
    
    const contactId = contact.id || contact._id;
    console.log('Contact ID:', contactId);
    
    if (!contactId) {
      console.error('Contact ID not found:', contact);
      Alert.alert('Error', 'Contact ID not found');
      return;
    }

    console.log('Showing delete confirmation for ID:', contactId);
    
    // Use confirm for web compatibility, Alert.alert for native
    if (typeof window !== 'undefined' && window.confirm) {
      // Web platform - use confirm
      const confirmed = window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`);
      if (confirmed) {
        try {
          console.log('Deleting contact with ID:', contactId);
          await contactsApi.delete(contactId);
          console.log('Contact deleted successfully');
          await loadContacts();
        } catch (error: any) {
          console.error('Delete error:', error);
          Alert.alert('Error', error.message || 'Failed to delete contact');
        }
      } else {
        console.log('Delete cancelled by user');
      }
    } else {
      // Native platform - use Alert.alert
      Alert.alert(
        'Delete Contact',
        `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('Delete cancelled') },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Deleting contact with ID:', contactId);
                await contactsApi.delete(contactId);
                console.log('Contact deleted successfully');
                await loadContacts();
              } catch (error: any) {
                console.error('Delete error:', error);
                Alert.alert('Error', error.message || 'Failed to delete contact');
              }
            },
          },
        ]
      );
    }
  };

  const handleEdit = (contact: Contact) => {
    const contactId = contact.id || contact._id;
    if (contactId) {
      router.push(`/edit-contact?id=${contactId}`);
    }
  };

  const getContactVisits = (contact: Contact) => {
    const contactId = contact.id || contact._id;
    // Only count future visits (scheduled visits)
    return allVisits.filter(visit => {
      if (visit.contactId !== contactId) return false;
      if (!visit.date || !visit.time) return false;
      const visitDateTime = new Date(`${visit.date}T${visit.time}`);
      return visitDateTime >= new Date();
    });
  };

  const handleShowVisits = (contact: Contact) => {
    const visits = getContactVisits(contact);
    setSelectedContactVisits(visits);
    setSelectedContactName(`${contact.firstName} ${contact.lastName}`);
    setShowVisitsModal(true);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const visitCount = getContactVisits(item).length;
    return (
      <View
        style={[
          styles.contactItem,
          {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
          },
        ]}>
        <View style={styles.contactInfoContainer}>
          <TouchableOpacity
            style={styles.contactInfoTouch}
            onPress={() => router.push(`/contact-detail/${item.id || item._id}`)}
            activeOpacity={0.7}>
            <View style={styles.contactInfo}>
              <ThemedText type="defaultSemiBold" style={styles.contactName}>
                {item.firstName} {item.lastName}
              </ThemedText>
              <ThemedText style={styles.contactPhone}>{item.phoneNumber}</ThemedText>
              <ThemedText style={styles.contactAddress}>{item.address}</ThemedText>
              {visitCount > 0 && (
                <TouchableOpacity
                  onPress={() => handleShowVisits(item)}
                  style={styles.visitCountBadge}
                  activeOpacity={0.7}>
                  <IconSymbol name="calendar" size={14} color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={[styles.visitCountText, { color: Colors[colorScheme ?? 'light'].tint }]}>
                    {visitCount} {visitCount === 1 ? 'visit' : 'visits'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.editButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="pencil" size={20} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              console.log('Delete button onPress triggered');
              handleDelete(item);
            }}
            style={styles.deleteButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <IconSymbol name="trash" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          cursorColor={Colors[colorScheme ?? 'light'].tint}
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
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
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

      <Modal
        visible={showVisitsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVisitsModal(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowVisitsModal(false)}>
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>
              Visits - {selectedContactName}
            </ThemedText>
            <View style={{ width: 32 }} />
          </View>
          <FlatList
            data={selectedContactVisits}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.visitModalItem,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  },
                ]}>
                <View style={styles.visitItemContent}>
                  <View style={styles.visitItemInfo}>
                    <View style={styles.visitModalHeader}>
                      <ThemedText style={styles.visitModalDate}>
                        {item.date ? formatDate(item.date) : 'No date'}
                      </ThemedText>
                      <ThemedText style={styles.visitModalTime}>
                        {item.time ? formatTime(item.time) : 'No time'}
                      </ThemedText>
                    </View>
                    {item.notes && (
                      <ThemedText style={styles.visitModalNotes}>{item.notes}</ThemedText>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setShowVisitsModal(false);
                      router.push(`/edit-visit?id=${item.id || item._id}&contact=${selectedContactName}`);
                    }}
                    style={styles.visitEditButton}>
                    <IconSymbol name="pencil" size={18} color={Colors[colorScheme ?? 'light'].tint} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
            contentContainerStyle={styles.visitsListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No visits scheduled</ThemedText>
              </View>
            }
          />
        </ThemedView>
      </Modal>
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
  contactInfoContainer: {
    flex: 1,
    marginRight: 8,
  },
  contactInfoTouch: {
    flex: 1,
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
  visitCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  visitCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  visitsListContent: {
    padding: 20,
    paddingTop: 10,
  },
  visitModalItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  visitItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  visitItemInfo: {
    flex: 1,
  },
  visitEditButton: {
    padding: 8,
  },
  visitModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitModalDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitModalTime: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  visitModalNotes: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});
