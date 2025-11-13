import { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
<<<<<<< HEAD
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Alert,
=======
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
>>>>>>> origin/main
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
<<<<<<< HEAD
import { visitsApi } from '@/services/mockApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from "@expo/vector-icons"; // ✅ Added import for floating button icon

function toYMDLocal(dt: Date) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeLocal(iso: string) {
  const dt = new Date(iso);
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDateLongLocal(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CalendarScreen() {
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(toYMDLocal(new Date()));
  const [selectedDateVisits, setSelectedDateVisits] = useState<any[]>([]);
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
      const normalized = (data || []).map((v: any) => {
        const datetime = v.datetime || v.date || v;
        const dt = new Date(datetime);
        const dateKey = toYMDLocal(dt);
        const time = formatTimeLocal(datetime);
        let contactName = '';
        let contactId = v.contact || v.contactId || (v.contact && (v.contact._id || v.contact.id));
        if (v.contact && typeof v.contact === 'object') {
          contactName = `${v.contact.firstName || ''} ${v.contact.lastName || ''}`.trim();
          contactId = v.contact._id || v.contact.id || contactId;
        } else {
          contactName = v.contactName || v.contactName || '';
        }
        return {
          id: v._id || v.id || String(Math.random()),
          datetime: datetime,
          date: dateKey,
          time,
          contactName,
          contactId,
          notes: v.notes || v.title || '',
          raw: v,
        };
      });

      setAllVisits(normalized);
      const filtered = normalized.filter((x) => x.date === selectedDate);
      setSelectedDateVisits(filtered);
    } catch (error) {
      console.error('loadVisits error', error);
=======
      setAllVisits(data);
      // Filter visits for selected date
      const filtered = data.filter((visit) => visit.date === selectedDate);
      setSelectedDateVisits(filtered);
    } catch (error) {
>>>>>>> origin/main
      Alert.alert('Error', 'Failed to load visits');
    }
  }, [selectedDate]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

<<<<<<< HEAD
=======
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

>>>>>>> origin/main
  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const filtered = allVisits.filter((visit) => visit.date === day.dateString);
    setSelectedDateVisits(filtered);
  };

<<<<<<< HEAD
  const markedDates = allVisits.reduce((acc: any, visit) => {
    if (!acc[visit.date]) {
      acc[visit.date] = { marked: true, dotColor: Colors[colorScheme ?? 'light'].tint };
    }
    return acc;
  }, {} as Record<string, any>);

  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: Colors[colorScheme ?? 'light'].tint };
  } else {
    markedDates[selectedDate] = { selected: true, selectedColor: Colors[colorScheme ?? 'light'].tint };
  }

=======
>>>>>>> origin/main
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

<<<<<<< HEAD
  const handleDelete = async (visit: any) => {
    Alert.alert('Delete Visit', `Delete visit with ${visit.contactName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await visitsApi.delete(visit.id);
            await loadVisits();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete visit');
          }
        },
      },
    ]);
  };

  const renderVisit = ({ item }: { item: any }) => (
    <View style={[styles.visitItem, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }]}>
      <View style={styles.visitInfo}>
        <View style={styles.visitHeader}>
          <ThemedText type="defaultSemiBold" style={styles.visitContactName}>{item.contactName || 'Unknown'}</ThemedText>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
=======
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
>>>>>>> origin/main
            <IconSymbol name="trash" size={18} color="#ff3b30" />
          </TouchableOpacity>
        </View>
        <View style={styles.visitDateTime}>
          <IconSymbol name="calendar" size={16} color={Colors[colorScheme ?? 'light'].tint} />
<<<<<<< HEAD
          <ThemedText style={styles.visitDate}>{formatDateLongLocal(item.datetime)}</ThemedText>
        </View>
        <View style={styles.visitDateTime}>
          <IconSymbol name="clock" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.visitTime}>{item.time}</ThemedText>
        </View>
        {item.notes ? <ThemedText style={styles.visitNotes}>{item.notes}</ThemedText> : null}
=======
          <ThemedText style={styles.visitDate}>{formatDate(item.date)}</ThemedText>
        </View>
        <View style={styles.visitDateTime}>
          <IconSymbol name="clock" size={16} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.visitTime}>{formatTime(item.time)}</ThemedText>
        </View>
        {item.notes && (
          <ThemedText style={styles.visitNotes}>{item.notes}</ThemedText>
        )}
>>>>>>> origin/main
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
<<<<<<< HEAD
        <ThemedText type="title" style={styles.title}>Calendar</ThemedText>
=======
        <ThemedText type="title" style={styles.title}>
          Calendar
        </ThemedText>
>>>>>>> origin/main
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
<<<<<<< HEAD
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={[styles.calendarContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5' }]}>
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
              arrowColor: Colors[colorScheme ?? 'light'].tint,
              monthTextColor: Colors[colorScheme ?? 'light'].text,
=======
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
>>>>>>> origin/main
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.visitsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
<<<<<<< HEAD
            Visits on {new Date(selectedDate).toLocaleDateString()}
=======
            Visits on {formatDate(selectedDate)}
>>>>>>> origin/main
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
<<<<<<< HEAD
              <IconSymbol name="calendar.badge.plus" size={48} color={Colors[colorScheme ?? 'light'].icon} />
              <ThemedText style={styles.emptyText}>No visits scheduled for this date</ThemedText>
=======
              <IconSymbol
                name="calendar.badge.plus"
                size={48}
                color={Colors[colorScheme ?? 'light'].icon}
              />
              <ThemedText style={styles.emptyText}>
                No visits scheduled for this date
              </ThemedText>
>>>>>>> origin/main
            </View>
          )}
        </View>
      </ScrollView>

<<<<<<< HEAD
      {/* ✅ Floating Add Visit Button */}
      <TouchableOpacity
        onPress={() => router.push("/schedule-visit")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
          borderRadius: 50,
          padding: 16,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
=======
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => router.push('/schedule-visit')}>
        <IconSymbol name="plus" size={28} color="#fff" />
>>>>>>> origin/main
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
  calendar: { borderRadius: 12 },
  visitsSection: { padding: 20, paddingTop: 0 },
  sectionTitle: { marginBottom: 16, fontSize: 20 },
  visitItem: { padding: 16, borderRadius: 8, marginBottom: 12 },
  visitInfo: { gap: 8 },
  visitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  visitContactName: { fontSize: 18 },
  deleteButton: { padding: 4 },
  visitDateTime: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  visitDate: { fontSize: 14 },
  visitTime: { fontSize: 14 },
  visitNotes: { fontSize: 14, marginTop: 4, opacity: 0.7, fontStyle: 'italic' },
  emptyContainer: { padding: 40, alignItems: 'center', gap: 16 },
  emptyText: { textAlign: 'center', opacity: 0.6, fontSize: 16 },
});
=======
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

>>>>>>> origin/main
