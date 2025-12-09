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
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi, notesApi, visitsApi, Contact, Note, Visit } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusPicker, ContactStatus } from '@/components/StatusPicker';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { DatePicker } from '@/components/DatePicker';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const loadContact = useCallback(async () => {
    if (!id) return;
    try {
      const data = await contactsApi.getById(id);
      setContact(data);
    } catch {
      Alert.alert('Error', 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadNotes = useCallback(async () => {
    if (!id) return;
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      const data = await notesApi.getByContactId(contactId);
      setNotes(data);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', error.message || 'Failed to load notes');
    }
  }, [id]);

  const loadVisits = useCallback(async () => {
    if (!id) return;
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      const data = await visitsApi.getByContactId(contactId);
      setVisits(data);
    } catch (error: any) {
      console.error('Error loading visits:', error);
    }
  }, [id]);

  useEffect(() => {
    loadContact();
    loadNotes();
    loadVisits();
  }, [loadContact, loadNotes, loadVisits]);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
      loadVisits();
    }, [loadNotes, loadVisits])
  );

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    setAddingNote(true);
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      await notesApi.create(contactId, newNote.trim());
      setNewNote('');
      await loadNotes();
    } catch (error: any) {
      console.error('Error adding note:', error);
      Alert.alert('Error', error.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (note: Note) => {
    const noteId = note.id || note._id;
    
    if (!noteId) {
      Alert.alert('Error', 'Note ID not found');
      return;
    }
    
    // Use confirm for web compatibility, Alert.alert for native
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web platform - use confirm
      const confirmed = window.confirm('Are you sure you want to delete this note?');
      if (confirmed) {
        try {
          await notesApi.delete(noteId);
          // Refresh the notes list
          await loadNotes();
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to delete note');
        }
      }
    } else {
      // Native platform - use Alert.alert
      Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notesApi.delete(noteId);
              // Refresh the notes list
              await loadNotes();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete note');
            }
          },
        },
      ]);
    }
  };

  const handleUpdateVisitStatus = async (visit: Visit, newStatus: string) => {
    const visitId = visit.id || visit._id;
    if (!visitId) {
      Alert.alert('Error', 'Visit ID not found');
      return;
    }

    try {
      await visitsApi.update(visitId, {
        status: newStatus as 'scheduled' | 'successful' | 'unable_to_contact' | 'rescheduled',
      } as any);
      await loadVisits();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update visit status');
    }
  };

  const getVisitStatusIcon = (status?: string) => {
    switch (status) {
      case 'successful':
        return { icon: 'checkmark.circle.fill', color: '#34C759' };
      case 'unable_to_contact':
        return { icon: 'xmark.circle.fill', color: '#FF3B30' };
      case 'rescheduled':
        return { icon: 'arrow.clockwise.circle.fill', color: '#FF9500' };
      default:
        return { icon: 'clock.fill', color: '#0A7EA4' };
    }
  };

  const isPastVisit = (visit: Visit) => {
    if (!visit.date || !visit.time) return false;
    const visitDateTime = new Date(`${visit.date}T${visit.time}`);
    return visitDateTime < new Date();
  };

  const scheduledVisits = visits.filter(v => !isPastVisit(v));
  const pastVisits = visits.filter(v => isPastVisit(v));

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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (status: ContactStatus) => {
    if (!id || !contact) return;
    setUpdating(true);
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      const updated = await contactsApi.update(contactId, { status });
      setContact(updated);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleProgressChange = async (progress: number) => {
    if (!id || !contact) return;
    setUpdating(true);
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      const updated = await contactsApi.update(contactId, { progress });
      setContact(updated);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleBaptismDateChange = async (date: string) => {
    if (!id || !contact) return;
    setUpdating(true);
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      const updated = await contactsApi.update(contactId, { baptismDate: date });
      setContact(updated);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update baptism date');
    } finally {
      setUpdating(false);
    }
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
                <IconSymbol name="mappin" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.infoText}>{contact.address}</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Status & Progress
          </ThemedText>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              },
            ]}>
            <View style={styles.infoCardRow}>
              <ThemedText style={styles.infoCardLabel}>Status</ThemedText>
              {updating ? (
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
              ) : (
                <StatusPicker
                  value={contact.status || 'interested'}
                  onChange={handleStatusChange}
                />
              )}
            </View>

            <View style={styles.infoCardRow}>
              <ThemedText style={styles.infoCardLabel}>Progress</ThemedText>
              {updating ? (
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
              ) : (
                <ProgressIndicator
                  progress={contact.progress || 0}
                  onChange={handleProgressChange}
                  editable={true}
                />
              )}
            </View>

            <View style={styles.infoCardRow}>
              <ThemedText style={styles.infoCardLabel}>Baptism Date</ThemedText>
              {updating ? (
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
              ) : (
                <DatePicker
                  value={contact.baptismDate ? contact.baptismDate.split('T')[0] : ''}
                  onChange={handleBaptismDateChange}
                />
              )}
            </View>
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
                  onPress={() => {
                    console.log('Delete button pressed for note:', item);
                    handleDeleteNote(item);
                  }}
                  style={styles.deleteNoteButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <IconSymbol name="trash" size={18} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyNotes}>
                <ThemedText style={styles.emptyNotesText}>No notes yet</ThemedText>
              </View>
            }
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Scheduled Visits
          </ThemedText>

          {scheduledVisits.length > 0 ? (
            <FlatList
              data={scheduledVisits}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    const visitId = item.id || item._id;
                    if (visitId) {
                      router.push(`/edit-visit?id=${visitId}&contact=${encodeURIComponent(contact.firstName + ' ' + contact.lastName)}`);
                    }
                  }}
                  style={[
                    styles.visitItem,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}>
                  <View style={styles.visitContent}>
                    <View style={styles.visitHeader}>
                      <ThemedText style={styles.visitDate}>
                        {item.date ? formatDateOnly(item.date) : 'No date'}
                      </ThemedText>
                      <ThemedText style={styles.visitTime}>
                        {item.time ? formatTime(item.time) : 'No time'}
                      </ThemedText>
                    </View>
                    {item.notes && (
                      <ThemedText style={styles.visitNotes}>{item.notes}</ThemedText>
                    )}
                  </View>
                  <View style={styles.editVisitButton}>
                    <IconSymbol name="pencil" size={18} color={Colors[colorScheme ?? 'light'].tint} />
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyNotes}>
              <ThemedText style={styles.emptyNotesText}>No visits scheduled</ThemedText>
            </View>
          )}
        </View>

        {pastVisits.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Past Visits
            </ThemedText>

            <FlatList
              data={pastVisits}
              renderItem={({ item }) => {
                const statusIcon = getVisitStatusIcon(item.status);
                return (
                  <TouchableOpacity
                    onLongPress={() => {
                      Alert.alert(
                        'Visit Status',
                        'Mark this visit as:',
                        [
                          {
                            text: '✓ Successful',
                            onPress: () => handleUpdateVisitStatus(item, 'successful'),
                          },
                          {
                            text: '✗ Unable to Contact',
                            onPress: () => handleUpdateVisitStatus(item, 'unable_to_contact'),
                          },
                          {
                            text: '↻ Rescheduled',
                            onPress: () => handleUpdateVisitStatus(item, 'rescheduled'),
                          },
                          { text: 'Cancel', style: 'cancel' },
                        ]
                      );
                    }}
                    style={[
                      styles.pastVisitItem,
                      {
                        backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      },
                    ]}>
                    <View style={styles.visitContent}>
                      <View style={styles.visitHeader}>
                        <ThemedText style={styles.visitDate}>
                          {item.date ? formatDateOnly(item.date) : 'No date'}
                        </ThemedText>
                        <ThemedText style={styles.visitTime}>
                          {item.time ? formatTime(item.time) : 'No time'}
                        </ThemedText>
                      </View>
                      {item.notes && (
                        <ThemedText style={styles.visitNotes}>{item.notes}</ThemedText>
                      )}
                    </View>
                    <View style={styles.visitStatusIcon}>
                      <IconSymbol 
                        name={statusIcon.icon as any} 
                        size={24} 
                        color={statusIcon.color} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              scrollEnabled={false}
            />

            <ThemedText style={styles.pastVisitsHint}>
              Tap and hold on a past visit to mark its status
            </ThemedText>
          </View>
        )}

        {/* -------------------- New Location Section -------------------- */}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Location
          </ThemedText>

          {Platform.OS === "web" ? (
            <div
              style={{
                width: "100%",
                height: 600,
                marginTop: 10,
              }}
              dangerouslySetInnerHTML={{
                __html: `
                  <iframe
                    width="100%"
                    height="600"
                    frameborder="0"
                    scrolling="no"
                    marginheight="0"
                    marginwidth="0"
                    src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(
                      contact.address || ""
                    )}&t=&z=14&ie=UTF8&iwloc=B&output=embed">
                  </iframe>
                `,
              }}
            />
          ) : (
            <View style={{ padding: 20 }}>
              <ThemedText style={{ opacity: 0.6 }}>
                Map preview is available on the web only.
              </ThemedText>
            </View>
          )}
        </View>

        {/* ------------------ End of Location Section ------------------ */}
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
    padding: 8,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyNotes: {
    padding: 20,
    alignItems: 'center',
  },
  emptyNotesText: {
    opacity: 0.6,
  },
  visitItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  pastVisitItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editVisitButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  visitStatusIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  pastVisitsHint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  visitContent: {
    gap: 8,
    flex: 1,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitTime: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  visitNotes: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    gap: 16,
  },
  infoCardRow: {
    gap: 8,
  },
  infoCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
});

