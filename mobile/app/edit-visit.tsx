import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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
  const router = useRouter();
  const { id } = useLocalSearchParams();
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
      const visit = await visitsApi.getById(visitId);
      if (visit) {
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
              onPress={() => {
                // For now, use simple text input - full calendar will be added via DatePicker component
              }}
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  justifyContent: 'center',
                },
              ]}>
              <ThemedText style={{ color: Colors[colorScheme ?? 'light'].text }}>
                {date || 'Select date'}
              </ThemedText>
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
});
