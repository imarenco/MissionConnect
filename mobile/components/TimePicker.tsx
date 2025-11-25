import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTime } from '@/lib/validation';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const colorScheme = useColorScheme();

  // Parse current value on mount or value change
  React.useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      setSelectedHour(hours || 0);
      setSelectedMinute(minutes || 0);
    }
  }, [value]);

  const handleConfirm = () => {
    const time = formatTime(selectedHour, selectedMinute);
    onChange(time);
    setShowTimePicker(false);
  };

  const displayTime = value || '00:00';

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            borderColor: Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => setShowTimePicker(true)}>
        <ThemedText style={styles.timeButtonText}>{displayTime}</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
              },
            ]}>
            <View style={styles.pickerHeader}>
              <ThemedText style={styles.pickerTitle}>Select Time</ThemedText>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <ThemedText style={styles.closeButton}>×</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <View style={styles.columnContainer}>
                <ThemedText style={styles.columnLabel}>Hour</ThemedText>
                <FlatList
                  data={hours}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeOption,
                        selectedHour === item && styles.selectedTimeOption,
                        {
                          backgroundColor:
                            selectedHour === item
                              ? Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tint
                              : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedHour(item)}>
                      <ThemedText
                        style={[
                          styles.timeOptionText,
                          selectedHour === item && styles.selectedTimeOptionText,
                        ]}>
                        {String(item).padStart(2, '0')}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.toString()}
                  style={{ height: 200 }}
                  scrollEnabled={true}
                  snapToAlignment="center"
                />
              </View>

              <ThemedText style={styles.separator}>:</ThemedText>

              <View style={styles.columnContainer}>
                <ThemedText style={styles.columnLabel}>Minute</ThemedText>
                <FlatList
                  data={minutes}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeOption,
                        selectedMinute === item && styles.selectedTimeOption,
                        {
                          backgroundColor:
                            selectedMinute === item
                              ? Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tint
                              : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedMinute(item)}>
                      <ThemedText
                        style={[
                          styles.timeOptionText,
                          selectedMinute === item && styles.selectedTimeOptionText,
                        ]}>
                        {String(item).padStart(2, '0')}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.toString()}
                  style={{ height: 200 }}
                  scrollEnabled={true}
                  snapToAlignment="center"
                />
              </View>
            </View>

            <View style={styles.pickerFooter}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tint,
                  },
                ]}
                onPress={handleConfirm}>
                <ThemedText style={styles.confirmButtonText}>Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  timeButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 32,
    fontWeight: '300',
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  columnContainer: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  timeOption: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeOption: {
    borderRadius: 8,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedTimeOptionText: {
    color: '#fff',
  },
  separator: {
    fontSize: 28,
    fontWeight: '600',
  },
  pickerFooter: {
    paddingHorizontal: 20,
    gap: 10,
  },
  confirmButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
