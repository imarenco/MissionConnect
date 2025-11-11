import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { visitsApi, Visit } from '@/services/mockApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function CalendarScreen() {
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDateVisits, setSelectedDateVisits] = useState<Visit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  const loadVisits = useCallback(async () => {
    try {
      const data = await visitsApi.getAll();
      setAllVisits(data);
      // Filter visits for selected date
      const filtered = data.filter((visit) => visit.date === selectedDate);
      setSelectedDateVisits(filtered);
    } catch (error) {
      Alert.alert('Error', 'Failed to load visits');
    }
  }, [selectedDate]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Create marked dates object for calendar
  const markedDates = allVisits.reduce((acc, visit) => {
    if (!acc[visit.date]) {
      acc[visit.date] = {
        marked: true,
        dotColor: Colors[colorScheme ?? 'light'].tint,
      };
    }
    return acc;
  }, {} as Record<string, { marked: boolean; dotColor: string }>);

  // Mark selected date
  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].tint,
    };
  } else {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].tint,
    };
  }

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const filtered = allVisits.filter((visit) => visit.date === day.dateString);
    setSelectedDateVisits(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const handleDelete = (visit: Visit) => {
    Alert.alert(
      'Delete Visit',
      `Are you sure you want to delete this visit with ${visit.contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await visitsApi.delete(visit.id);
              await loadVisits();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete visit');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <View
      style={[
        styles.visitItem,
        {
          backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
        },
      ]}>
      <View style={styles.visitInfo}>
        <View style={styles.visitHeader}>
          <ThemedText type="defaultSemiBold" style={styles.visitContactName}>
            {item.contactName}
          </ThemedText>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}>
            <IconSymbol name="trash" size={18} color="#ff3b30" />
          </TouchableOpacity>
        </View>
        <View style={styles.visitDateTime}>
          <IconSymbol name="calendar" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.visitDate}>{formatDate(item.date)}</ThemedText>
        </View>
        <View style={styles.visitDateTime}>
          <IconSymbol name="clock" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.visitTime}>{formatTime(item.time)}</ThemedText>
        </View>
        {item.notes && (
          <ThemedText style={styles.visitNotes}>{item.notes}</ThemedText>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Calendar
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View
          style={[
            styles.calendarContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            },
          ]}>
          <Calendar
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={markedDates}
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
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.visitsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Visits on {formatDate(selectedDate)}
          </ThemedText>

          {selectedDateVisits.length > 0 ? (
            <FlatList
              data={selectedDateVisits}
              renderItem={renderVisit}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="calendar.badge.plus"
                size={48}
                color={Colors[colorScheme ?? 'light'].icon}
              />
              <ThemedText style={styles.emptyText}>
                No visits scheduled for this date
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => router.push('/schedule-visit')}>
        <IconSymbol name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calendarContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendar: {
    borderRadius: 12,
  },
  visitsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  visitItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  visitInfo: {
    gap: 8,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitContactName: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 4,
  },
  visitDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitDate: {
    fontSize: 14,
  },
  visitTime: {
    fontSize: 14,
  },
  visitNotes: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

