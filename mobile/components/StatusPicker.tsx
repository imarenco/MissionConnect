import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ContactStatus =
  | 'interested'
  | 'teaching'
  | 'baptized'
  | 'not_interested'
  | 'member'
  | 'other';

interface StatusPickerProps {
  value?: ContactStatus;
  onChange: (status: ContactStatus) => void;
  label?: string;
}

const statusOptions: { value: ContactStatus; label: string; icon: string }[] = [
  { value: 'interested', label: 'Interested', icon: 'star.fill' },
  { value: 'teaching', label: 'Teaching', icon: 'book.fill' },
  { value: 'baptized', label: 'Baptized', icon: 'drop.fill' },
  { value: 'not_interested', label: 'Not Interested', icon: 'xmark.circle.fill' },
  { value: 'member', label: 'Member', icon: 'person.2.fill' },
  { value: 'other', label: 'Other', icon: 'ellipsis.circle.fill' },
];

export const StatusPicker: React.FC<StatusPickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();

  const selectedStatus = statusOptions.find((opt) => opt.value === value);

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case 'interested':
        return '#34C759'; // Green
      case 'teaching':
        return '#007AFF'; // Blue
      case 'baptized':
        return '#5AC8FA'; // Light Blue
      case 'not_interested':
        return '#FF3B30'; // Red
      case 'member':
        return '#AF52DE'; // Purple
      case 'other':
        return '#8E8E93'; // Gray
      default:
        return Colors[colorScheme ?? 'light'].tint;
    }
  };

  return (
    <View>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <TouchableOpacity
        style={[
          styles.pickerButton,
          {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
            borderColor: value ? getStatusColor(value) : Colors[colorScheme ?? 'light'].tint,
          },
        ]}
        onPress={() => setShowModal(true)}>
        <View style={styles.pickerContent}>
          {selectedStatus && (
            <>
              <IconSymbol
                name={selectedStatus.icon}
                size={20}
                color={getStatusColor(value!)}
              />
              <ThemedText style={styles.pickerText}>
                {selectedStatus.label}
              </ThemedText>
            </>
          )}
          {!selectedStatus && (
            <ThemedText style={[styles.pickerText, { opacity: 0.6 }]}>
              Select status
            </ThemedText>
          )}
        </View>
        <IconSymbol
          name="chevron.down"
          size={16}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Select Status
              </ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <IconSymbol
                  name="xmark"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                    },
                    value === option.value && {
                      backgroundColor: getStatusColor(option.value) + '20',
                    },
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setShowModal(false);
                  }}>
                  <View style={styles.optionContent}>
                    <IconSymbol
                      name={option.icon}
                      size={24}
                      color={getStatusColor(option.value)}
                    />
                    <ThemedText style={styles.optionText}>
                      {option.label}
                    </ThemedText>
                  </View>
                  {value === option.value && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color={getStatusColor(option.value)}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
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
  pickerButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
  },
  optionsList: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

