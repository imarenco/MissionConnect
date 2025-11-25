import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/validation';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  label,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const colorScheme = useColorScheme();

  const handleDateSelect = (day: DateData) => {
    onChange(day.dateString);
    setShowCalendar(false);
  };

  const displayDate = value ? new Date(value).toLocaleDateString() : 'Select a date';

  const markedDates: any = {};
  if (value) {
    markedDates[value] = {
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].tint,
      selectedTextColor: '#fff',
    };
  }

  return (
    <View>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            borderColor: Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => setShowCalendar(true)}>
        <ThemedText style={styles.dateButtonText}>{displayDate}</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.calendarContainer,
              {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              },
            ]}>
            <View style={styles.calendarHeader}>
              <ThemedText style={styles.calendarTitle}>Select Date</ThemedText>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <ThemedText style={styles.closeButton}>×</ThemedText>
              </TouchableOpacity>
            </View>

            <Calendar
              current={value || formatDate(new Date())}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={calendarTheme(colorScheme ?? 'light')}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const calendarTheme = (colorScheme: string | null) => {
  const scheme = (colorScheme ?? 'light') as 'light' | 'dark';
  return {
    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
    calendarBackground: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
    textSectionTitleColor: colorScheme === 'dark' ? '#ccc' : '#333',
    selectedDayBackgroundColor: Colors[scheme].tint,
    selectedDayTextColor: '#fff',
    todayTextColor: Colors[scheme].tint,
    dayTextColor: colorScheme === 'dark' ? '#ccc' : '#333',
    textDisabledColor: colorScheme === 'dark' ? '#555' : '#ccc',
    dotColor: Colors[scheme].tint,
    selectedDotColor: '#fff',
    monthTextColor: colorScheme === 'dark' ? '#ccc' : '#333',
    indicatorColor: Colors[scheme].tint,
    textDayFontWeight: 500 as any,
    textMonthFontWeight: 600 as any,
    textDayHeaderFontWeight: 500 as any,
    textDayFontSize: 14,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 14,
  };
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  dateButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  calendarContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 32,
    fontWeight: '300',
  },
});
