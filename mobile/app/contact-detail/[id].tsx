import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, notesApi, Contact, Note } from '@/services/mockApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const loadContact = useCallback(async () => {
    if (!id) return;
    try {
      const data = await contactsApi.getById(id);
      setContact(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    try {
      const data = await notesApi.getByContactId(id);
      setNotes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notes');
    }
  }, [id]);

  useEffect(() => {
    loadContact();
    loadNotes();
  }, [loadContact, loadNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    setAddingNote(true);
    try {
      await notesApi.create(id, newNote.trim());
      setNewNote('');
      await loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesApi.delete(noteId);
            await loadNotes();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <ThemedText type="title" style={styles.title}>
          Contact Details
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View
          style={[
            styles.contactCard,
            {
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            },
          ]}>
          <View style={styles.contactHeader}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {contact.firstName[0]}{contact.lastName[0]}
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
              <ThemedText style={styles.infoText}>{contact.phoneNumber}</ThemedText>
            </View>

            {contact.address && (
              <View style={styles.infoRow}>
                <IconSymbol name="mappin.fill" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.infoText}>{contact.address}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notes
          </ThemedText>

          <View
            style={[
              styles.noteInputContainer,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              },
            ]}>
            <TextInput
              style={[
                styles.noteInput,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Add a note..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={newNote}
              onChangeText={setNewNote}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[
                styles.addNoteButton,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].tint,
                  opacity: addingNote ? 0.6 : 1,
                },
              ]}
              onPress={handleAddNote}
              disabled={addingNote || !newNote.trim()}>
              {addingNote ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <IconSymbol name="plus" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={notes}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.noteItem,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  },
                ]}>
                <View style={styles.noteContent}>
                  <ThemedText style={styles.noteText}>{item.content}</ThemedText>
                  <ThemedText style={styles.noteDate}>{formatDate(item.createdAt)}</ThemedText>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteNote(item.id)}
                  style={styles.deleteNoteButton}>
                  <IconSymbol name="trash" size={18} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyNotes}>
                <ThemedText style={styles.emptyNotesText}>No notes yet</ThemedText>
              </View>
            }
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
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
    gap: 24,
  },
  contactCard: {
    padding: 20,
    borderRadius: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactNameContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 24,
  },
  contactInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  noteInputContainer: {
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  noteInput: {
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  addNoteButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  noteContent: {
    flex: 1,
    gap: 4,
  },
  noteText: {
    fontSize: 16,
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteNoteButton: {
    padding: 4,
  },
  emptyNotes: {
    padding: 20,
    alignItems: 'center',
  },
  emptyNotesText: {
    opacity: 0.6,
  },
});

