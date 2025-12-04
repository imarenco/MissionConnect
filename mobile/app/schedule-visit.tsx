import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, visitsApi, Contact } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatePicker } from '@/components/DatePicker';
import { TimePicker } from '@/components/TimePicker';
import { isNotEmpty, isFutureDate, formatDate } from '@/lib/validation';

export default function ScheduleVisitScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [date, setDate] = useState(formatDate(new Date()));
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const router = useRouter();
  const { date: paramDate, time: paramTime } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (paramDate) {
      setDate(Array.isArray(paramDate) ? paramDate[0] : paramDate);
    }
    if (paramTime) {
      setTime(Array.isArray(paramTime) ? paramTime[0] : paramTime);
    }
    loadContacts();
  }, [paramDate, paramTime]);

  const loadContacts = async () => {
    try {
      const data = await contactsApi.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch {
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = contacts.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(query.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(query.toLowerCase()) ||
          `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  };

  const handleSchedule = async () => {
    // Validation
    if (!selectedContactId) {
      Alert.alert('Validation Error', 'Please select a contact');
      return;
    }
    if (!isNotEmpty(date)) {
      Alert.alert('Validation Error', 'Please select a date');
      return;
    }
    if (!isNotEmpty(time)) {
      Alert.alert('Validation Error', 'Please select a time');
      return;
    }

    // Validate that the date is in the future
    if (!isFutureDate(date, time)) {
      Alert.alert('Validation Error', 'Please select a date and time in the future');
      return;
    }

    setLoading(true);
    try {
      await visitsApi.create({
        contactId: selectedContactId,
        date: date.trim(),
        time: time.trim(),
        notes: notes.trim(),
      } as any);

      // Reset loading state before navigation
      setLoading(false);
      // Navigate back with refresh signal
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to schedule visit. Please try again.');
    }
  };

  const selectedContact = contacts.find((c) => (c.id || c._id) === selectedContactId);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Schedule Visit
        </ThemedText>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Select Contact <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            {loadingContacts ? (
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
            ) : (
              <>
                <View
                  style={[
                    styles.searchContainer,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    },
                  ]}
                >
                  <IconSymbol name="magnifyingglass" size={18} color={Colors[colorScheme ?? 'light'].icon} />
                  <TextInput
                    style={[
                      styles.searchInput,
                      {
                        color: Colors[colorScheme ?? 'light'].text,
                      },
                    ]}
                    placeholder="Search contacts..."
                    placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                      <IconSymbol name="xmark.circle.fill" size={18} color={Colors[colorScheme ?? 'light'].icon} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <FlatList
                  data={filteredContacts}
                  renderItem={({ item }) => {
                    const itemId = item.id || item._id || '';
                    return (
                      <TouchableOpacity
                        style={[
                          styles.contactOption,
                          {
                            backgroundColor:
                              selectedContactId === itemId
                                ? Colors[colorScheme ?? 'light'].tint
                                : colorScheme === 'dark'
                                ? '#2a2a2a'
                                : '#f5f5f5',
                          },
                        ]}
                        onPress={() => setSelectedContactId(itemId || null)}>
                        <ThemedText
                          style={[
                            styles.contactOptionText,
                            {
                              color:
                                selectedContactId === itemId
                                  ? '#fff'
                                  : Colors[colorScheme ?? 'light'].text,
                            },
                          ]}>
                          {item.firstName} {item.lastName}
                        </ThemedText>
                        {selectedContactId === itemId && (
                          <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>
                      {searchQuery ? 'No contacts found' : 'No contacts available'}
                    </ThemedText>
                  }
                />
              </>
            )}
          </View>

          {selectedContact && (
            <View
              style={[
                styles.selectedContactInfo,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                },
              ]}>
              <ThemedText style={styles.selectedContactLabel}>Selected Contact:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {selectedContact.firstName} {selectedContact.lastName}
              </ThemedText>
              <ThemedText style={styles.selectedContactPhone}>{selectedContact.phoneNumber}</ThemedText>
            </View>
          )}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Date <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <DatePicker
              value={date}
              onChange={setDate}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Time <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TimePicker
              value={time}
              onChange={setTime}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Notes</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Add notes about this visit..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].tint,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={handleSchedule}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Schedule Visit</ThemedText>
          )}
        </TouchableOpacity>
      </View>
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
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#ff3b30',
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contactOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactOptionText: {
    fontSize: 16,
  },
  selectedContactInfo: {
    padding: 16,
    borderRadius: 8,
    gap: 4,
  },
  selectedContactLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  selectedContactPhone: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    opacity: 0.6,
    padding: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

