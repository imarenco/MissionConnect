import { useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/(tabs)/contacts');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <ThemedText type="title" style={styles.logoText}>
            MissionConnect
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
              },
            ]}
            onPress={() => router.push('/register')}>
            <ThemedText style={styles.buttonText}>Register</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonOutline,
              {
                borderColor: Colors[colorScheme ?? 'light'].tint,
              },
            ]}
            onPress={() => router.push('/login')}>
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: Colors[colorScheme ?? 'light'].tint,
                },
              ]}>
              Login
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

