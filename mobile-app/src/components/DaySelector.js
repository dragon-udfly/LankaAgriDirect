import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONTS } from '../theme/colors';

const DAYS = [
  { label: 'Mon', value: 'Monday' },
  { label: 'Tue', value: 'Tuesday' },
  { label: 'Wed', value: 'Wednesday' },
  { label: 'Thu', value: 'Thursday' },
  { label: 'Fri', value: 'Friday' },
  { label: 'Sat', value: 'Saturday' },
  { label: 'Sun', value: 'Sunday' },
];

const DaySelector = ({ value, onChange, error, label = 'Operating Days' }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse comma-separated days from value
  const selectedDays = value
    ? value
        .split(',')
        .map(d => d.trim())
        .filter(d => d)
    : [];

  const toggleDay = (dayValue) => {
    let newDays;
    if (selectedDays.includes(dayValue)) {
      newDays = selectedDays.filter(d => d !== dayValue);
    } else {
      newDays = [...selectedDays, dayValue];
    }
    // Sort days in week order
    const sortedDays = DAYS.map(d => d.value)
      .filter(d => newDays.includes(d));
    onChange(sortedDays.join(', '));
  };

  const displayValue = selectedDays.length > 0 
    ? selectedDays.join(', ')
    : 'Select operating days';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(!showPicker)}
      >
        <Text style={[styles.inputText, !selectedDays.length && styles.placeholder]}>
          {displayValue}
        </Text>
        <Text style={styles.chevron}>{showPicker ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showPicker && (
        <View style={styles.picker}>
          <ScrollView>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayOption,
                  selectedDays.includes(day.value) && styles.dayOptionSelected,
                ]}
                onPress={() => toggleDay(day.value)}
              >
                <View style={styles.checkbox}>
                  {selectedDays.includes(day.value) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.dayLabel,
                  selectedDays.includes(day.value) && styles.dayLabelSelected,
                ]}>
                  {day.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.doneBtn}
            onPress={() => setShowPicker(false)}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    backgroundColor: COLORS.surface || '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: COLORS.error || '#d32f2f',
  },
  inputText: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  placeholder: {
    color: COLORS.textSecondary || '#999',
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textSecondary || '#999',
    marginLeft: SPACING.sm,
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: COLORS.surface || '#f5f5f5',
    maxHeight: 250,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  dayOptionSelected: {
    backgroundColor: COLORS.primaryLight || '#e6f4ea',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayLabel: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  dayLabelSelected: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    ...FONTS.body,
  },
  errorText: {
    color: COLORS.error || '#d32f2f',
    fontSize: 12,
    marginTop: SPACING.xs,
    ...FONTS.medium,
  },
});

export default DaySelector;
