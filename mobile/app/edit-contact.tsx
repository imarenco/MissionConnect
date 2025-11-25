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
import { contactsApi, Contact } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isNotEmpty, isValidPhoneNumber } from '@/lib/validation';

export default function EditContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (id) {
      loadContact();
    }
  }, [id]);

  const loadContact = async () => {
    try {
      setInitialLoading(true);
      const contactId = Array.isArray(id) ? id[0] : id;
      const contact = await contactsApi.getById(contactId);
      if (contact) {
        setFirstName(contact.firstName);
        setLastName(contact.lastName);
        setAddress(contact.address || '');
        setPhoneNumber(contact.phoneNumber || contact.phone || '');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load contact');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

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

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const contactId = Array.isArray(id) ? id[0] : id;
      await contactsApi.update(contactId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to update contact. Please try again.');
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
          Edit Contact
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
            <ThemedText style={styles.buttonText}>Update Contact</ThemedText>
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
