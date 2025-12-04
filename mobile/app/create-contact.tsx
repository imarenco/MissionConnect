import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { contactsApi } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isNotEmpty, isValidPhoneNumber } from '@/lib/validation';
import { StatusPicker, ContactStatus } from '@/components/StatusPicker';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { DatePicker } from '@/components/DatePicker';

export default function CreateContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<ContactStatus>('interested');
  const [progress, setProgress] = useState(0);
  const [baptismDate, setBaptismDate] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const validateForm = () => {
    if (!isNotEmpty(firstName)) {
      Alert.alert('Validation Error', 'First name is required');
      return false;
    }
    if (!isNotEmpty(lastName)) {
      Alert.alert('Validation Error', 'Last name is required');
      return false;
    }
    if (!isNotEmpty(phoneNumber)) {
      Alert.alert('Validation Error', 'Phone number is required');
      return false;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await contactsApi.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        status,
        progress,
        baptismDate: baptismDate || undefined,
      });
      // Reset loading state before navigation
      setLoading(false);
      // Navigate back with refresh signal
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to create contact. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          New Contact
        </ThemedText>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              First Name <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Enter first name"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Last Name <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Enter last name"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              Phone Number <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Enter phone number"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
            {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
              <ThemedText style={styles.errorText}>Please enter a valid phone number (at least 10 digits)</ThemedText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Address</ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              placeholder="Enter address"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <StatusPicker
              value={status}
              onChange={setStatus}
              label="Status"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Progress (Lessons Taught)</ThemedText>
            <ProgressIndicator
              progress={progress}
              onChange={setProgress}
              editable={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <DatePicker
              value={baptismDate}
              onChange={setBaptismDate}
              label="Baptism Date (Optional)"
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
          onPress={handleCreate}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Create Contact</ThemedText>
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
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
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

