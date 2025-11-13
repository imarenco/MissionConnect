<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState, useEffect, useCallback } from 'react';
>>>>>>> origin/main
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
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
<<<<<<< HEAD
import { contactsApi, visitsApi } from '@/services/mockApi';
=======
import { contactsApi, visitsApi, Contact } from '@/services/mockApi';
>>>>>>> origin/main
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScheduleVisitScreen() {
<<<<<<< HEAD
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState(''); // HH:MM
=======
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
>>>>>>> origin/main
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await contactsApi.getAll();
<<<<<<< HEAD
      const normalized = (data || []).map((c: any) => ({ ...c, id: c._id || c.id }));
      setContacts(normalized);
    } catch (err) {
      console.error('loadContacts error', err);
=======
      setContacts(data);
    } catch (error) {
>>>>>>> origin/main
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedContactId) {
      Alert.alert('Validation Error', 'Please select a contact');
      return;
    }
<<<<<<< HEAD
    if (!date.trim() || !time.trim()) {
      Alert.alert('Validation Error', 'Please enter both date and time');
      return;
    }

    const combined = `${date}T${time}:00`;
    const dt = new Date(combined);

    if (isNaN(dt.getTime())) {
      Alert.alert('Validation Error', 'Invalid date or time format (use YYYY-MM-DD and HH:MM)');
=======
    if (!date.trim()) {
      Alert.alert('Validation Error', 'Please select a date');
      return;
    }
    if (!time.trim()) {
      Alert.alert('Validation Error', 'Please select a time');
>>>>>>> origin/main
      return;
    }

    setLoading(true);
    try {
      await visitsApi.create({
<<<<<<< HEAD
        contact: selectedContactId,
        datetime: dt.toISOString(),
        notes: notes.trim(),
      });

=======
        contactId: selectedContactId,
        date: date.trim(),
        time: time.trim(),
        notes: notes.trim(),
      });
>>>>>>> origin/main
      Alert.alert('Success', 'Visit scheduled successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
<<<<<<< HEAD
      console.error('Error scheduling visit:', error);
=======
>>>>>>> origin/main
      Alert.alert('Error', error.message || 'Failed to schedule visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const selectedContact = contacts.find((c) => c._id === selectedContactId || c.id === selectedContactId);
=======
  const selectedContact = contacts.find((c) => c.id === selectedContactId);
>>>>>>> origin/main

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
              <FlatList
                data={contacts}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      {
                        backgroundColor:
<<<<<<< HEAD
                          selectedContactId === (item._id || item.id)
=======
                          selectedContactId === item.id
>>>>>>> origin/main
                            ? Colors[colorScheme ?? 'light'].tint
                            : colorScheme === 'dark'
                            ? '#2a2a2a'
                            : '#f5f5f5',
                      },
                    ]}
<<<<<<< HEAD
                    onPress={() => setSelectedContactId(item._id || item.id)}>
=======
                    onPress={() => setSelectedContactId(item.id)}>
>>>>>>> origin/main
                    <ThemedText
                      style={[
                        styles.contactOptionText,
                        {
                          color:
<<<<<<< HEAD
                            selectedContactId === (item._id || item.id)
=======
                            selectedContactId === item.id
>>>>>>> origin/main
                              ? '#fff'
                              : Colors[colorScheme ?? 'light'].text,
                        },
                      ]}>
                      {item.firstName} {item.lastName}
                    </ThemedText>
<<<<<<< HEAD
                    {selectedContactId === (item._id || item.id) && (
=======
                    {selectedContactId === item.id && (
>>>>>>> origin/main
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                )}
<<<<<<< HEAD
                keyExtractor={(item) => item._id || item.id}
                scrollEnabled={false}
                ListEmptyComponent={<ThemedText style={styles.emptyText}>No contacts available</ThemedText>}
=======
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <ThemedText style={styles.emptyText}>No contacts available</ThemedText>
                }
>>>>>>> origin/main
              />
            )}
          </View>

          {selectedContact && (
<<<<<<< HEAD
            <View style={[styles.selectedContactInfo, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }]}>
              <ThemedText style={styles.selectedContactLabel}>Selected Contact:</ThemedText>
              <ThemedText type="defaultSemiBold">{selectedContact.firstName} {selectedContact.lastName}</ThemedText>
              <ThemedText style={styles.selectedContactPhone}>{selectedContact.phone || selectedContact.phoneNumber}</ThemedText>
=======
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
>>>>>>> origin/main
            </View>
          )}

          <View style={styles.inputContainer}>
<<<<<<< HEAD
            <ThemedText style={styles.label}>Date (YYYY-MM-DD)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="2025-11-20"
=======
            <ThemedText style={styles.label}>
              Date <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="YYYY-MM-DD (e.g., 2024-12-25)"
>>>>>>> origin/main
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={date}
              onChangeText={setDate}
            />
<<<<<<< HEAD
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Time (HH:MM)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="14:30"
=======
            <ThemedText style={styles.hint}>Format: YYYY-MM-DD</ThemedText>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Time <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="HH:MM (e.g., 14:30)"
>>>>>>> origin/main
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={time}
              onChangeText={setTime}
            />
<<<<<<< HEAD
=======
            <ThemedText style={styles.hint}>Format: HH:MM (24-hour format)</ThemedText>
>>>>>>> origin/main
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Notes</ThemedText>
            <TextInput
<<<<<<< HEAD
              style={[styles.input, styles.textArea, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Notes about visit"
=======
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Add notes about this visit..."
>>>>>>> origin/main
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
<<<<<<< HEAD
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint, opacity: loading ? 0.6 : 1 }]} onPress={handleSchedule} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Schedule Visit</ThemedText>}
=======
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
>>>>>>> origin/main
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  closeButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24 },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  form: { gap: 20 },
  inputContainer: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  required: { color: '#ff3b30' },
  input: { padding: 12, borderRadius: 8, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  contactOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  contactOptionText: { fontSize: 16 },
  selectedContactInfo: { padding: 16, borderRadius: 8, gap: 4 },
  selectedContactLabel: { fontSize: 12, opacity: 0.7, marginBottom: 4 },
  selectedContactPhone: { fontSize: 14, opacity: 0.7 },
  emptyText: { opacity: 0.6, padding: 12 },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#fff' },
});
=======
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

>>>>>>> origin/main
