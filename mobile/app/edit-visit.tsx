import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { visitsApi, Visit } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Calendar, DateData } from 'react-native-calendars';
import { isFutureDate } from '@/lib/validation';

export default function EditVisitScreen() {
  const [contactName, setContactName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const { id, contact } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    try {
      setInitialLoading(true);
      const visitId = Array.isArray(id) ? id[0] : id;
      
      // If contact name was passed in params, use it directly
      if (contact) {
        const contactName = Array.isArray(contact) ? contact[0] : contact;
        setContactName(contactName);
      }
      
      const visit = await visitsApi.getById(visitId);
      if (visit) {
        // Use contact from params if available, otherwise from visit data
        setContactName(visit.contactName || '');
        setDate(visit.date || '');
        setTime(visit.time || '14:00');
        setNotes(visit.notes || '');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load visit');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    if (!date) {
      Alert.alert('Validation Error', 'Date is required');
      return false;
    }
    if (!time) {
      Alert.alert('Validation Error', 'Time is required');
      return false;
    }
    if (!isFutureDate(date, time)) {
      Alert.alert('Validation Error', 'Visit date must be in the future');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const visitId = Array.isArray(id) ? id[0] : id;
      await visitsApi.update(visitId, {
        date,
        time,
        notes: notes.trim(),
      } as Partial<Visit>);
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to update visit. Please try again.');
    }
  };

  if (initialLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          Edit Visit
        </ThemedText>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Contact Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.disabledInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={contactName}
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Date <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  justifyContent: 'center',
                },
              ]}>
              <View style={styles.datePickerDisplay}>
                <IconSymbol name="calendar" size={20} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={{ color: Colors[colorScheme ?? 'light'].text }}>
                  {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date'}
                </ThemedText>
              </View>
            </TouchableOpacity>
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
              placeholder="HH:MM"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={time}
              onChangeText={setTime}
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
              numberOfLines={3}
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
          onPress={handleUpdate}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Update Visit</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.modalTitle}>
              Select Date
            </ThemedText>
            <View style={{ width: 32 }} />
          </View>
          <View style={[styles.calendarContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }]}>
            <Calendar
              current={date || new Date().toISOString().split('T')[0]}
              onDayPress={(day: DateData) => {
                setDate(day.dateString);
                setShowDatePicker(false);
              }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                calendarBackground: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                textSectionTitleColor: Colors[colorScheme ?? 'light'].text,
                selectedDayBackgroundColor: Colors[colorScheme ?? 'light'].tint,
                selectedDayTextColor: '#ffffff',
                todayTextColor: Colors[colorScheme ?? 'light'].tint,
                dayTextColor: Colors[colorScheme ?? 'light'].text,
                textDisabledColor: colorScheme === 'dark' ? '#555' : '#d9e1e8',
                dotColor: Colors[colorScheme ?? 'light'].tint,
                selectedDotColor: '#ffffff',
                arrowColor: Colors[colorScheme ?? 'light'].tint,
                monthTextColor: Colors[colorScheme ?? 'light'].text,
                indicatorColor: Colors[colorScheme ?? 'light'].tint,
                textDayFontWeight: '600',
                textMonthFontWeight: 'bold',
              }}
            />
          </View>
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
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  datePickerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  disabledInput: {
    opacity: 0.6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  calendarContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
