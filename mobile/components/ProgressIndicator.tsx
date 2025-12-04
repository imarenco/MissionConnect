import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressIndicatorProps {
  progress: number; // 0-5
  onChange?: (progress: number) => void;
  editable?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  onChange,
  editable = false,
}) => {
  const colorScheme = useColorScheme();
  const maxProgress = 5;

  const handlePress = (value: number) => {
    if (editable && onChange) {
      onChange(value);
    }
  };

  const renderDot = (index: number) => {
    const isFilled = index < progress;
    const Component = editable ? TouchableOpacity : View;

    return (
      <Component
        key={index}
        onPress={() => editable && handlePress(index + 1)}
        style={[
          styles.dot,
          {
            backgroundColor: isFilled
              ? Colors[colorScheme ?? 'light'].tint
              : colorScheme === 'dark'
              ? '#444'
              : '#e0e0e0',
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: maxProgress }, (_, i) => renderDot(i))}
      </View>
      <ThemedText style={styles.label}>
        {progress === 0
          ? 'No lessons'
          : progress === 1
          ? '1 lesson'
          : `${progress} lessons`}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});

