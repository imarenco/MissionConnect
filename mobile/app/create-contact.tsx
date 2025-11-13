// mobile/app/create-contact.tsx
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
import { contactsApi } from '@/services/mockApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
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
        phoneNumber: phoneNumber.trim(),
      });
      Alert.alert('Success', 'Contact created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('Create contact error', err);
      Alert.alert('Error', err.message || 'Failed to create contact');
    } finally {
      setLoading(false);
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
            <ThemedText style={styles.label}>First Name *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="First name"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Last Name</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Last name"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Phone Number *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Phone number"
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Address</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5', color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Address"
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
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint, opacity: loading ? 0.6 : 1 }]} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Create Contact</ThemedText>}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '600', color: '#fff' },
});
