import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONTS } from '../theme/colors';

const TimeInput = ({ 
  label = 'Time', 
  value, 
  onChange, 
  error,
  placeholder = 'Select time'
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hours, setHours] = useState(value ? parseInt(value.split(':')[0]) : 8);
  const [minutes, setMinutes] = useState(value ? parseInt(value.split(':')[1]) : 0);

  // Convert 24-hour format to 12-hour display format
  const getDisplayTime = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };

  const handleTimeConfirm = () => {
    const timeValue = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onChange(timeValue);
    setShowPicker(false);
  };

  const displayValue = value ? getDisplayTime(parseInt(value.split(':')[0]), parseInt(value.split(':')[1])) : placeholder;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        
        <TouchableOpacity 
          style={[styles.input, error && styles.inputError]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.inputText, !value && styles.placeholder]}>
            {displayValue}
          </Text>
          <Text style={styles.icon}>🕐</Text>
        </TouchableOpacity>

        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerTitle}>{label}</Text>
              
              <View style={styles.timeInputRow}>
                <View style={styles.timeColumnContainer}>
                  <Text style={styles.timeLabel}>Hour</Text>
                  <View style={styles.hoursMinutesContainer}>
                    <TouchableOpacity 
                      onPress={() => setHours(h => h === 0 ? 23 : h - 1)}
                      style={styles.upDownBtn}
                    >
                      <Text style={styles.upDownText}>▲</Text>
                    </TouchableOpacity>
                    
                    <ScrollView 
                      style={styles.scrollContainer}
                      showsVerticalScrollIndicator={true}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => setHours(i)}
                          style={[
                            styles.timeOption,
                            hours === i && styles.timeOptionSelected,
                          ]}
                        >
                          <Text style={[
                            styles.timeOptionText,
                            hours === i && styles.timeOptionTextSelected,
                          ]}>
                            {String(i).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity 
                      onPress={() => setHours(h => (h + 1) % 24)}
                      style={styles.upDownBtn}
                    >
                      <Text style={styles.upDownText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.separator}>:</Text>

                <View style={styles.timeColumnContainer}>
                  <Text style={styles.timeLabel}>Minute</Text>
                  <View style={styles.hoursMinutesContainer}>
                    <TouchableOpacity 
                      onPress={() => setMinutes(m => m === 0 ? 45 : m - 15)}
                      style={styles.upDownBtn}
                    >
                      <Text style={styles.upDownText}>▲</Text>
                    </TouchableOpacity>
                    
                    <ScrollView 
                      style={styles.scrollContainer}
                      showsVerticalScrollIndicator={true}
                    >
                      {[0, 15, 30, 45].map(m => (
                        <TouchableOpacity
                          key={m}
                          onPress={() => setMinutes(m)}
                          style={[
                            styles.timeOption,
                            minutes === m && styles.timeOptionSelected,
                          ]}
                        >
                          <Text style={[
                            styles.timeOptionText,
                            minutes === m && styles.timeOptionTextSelected,
                          ]}>
                            {String(m).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity 
                      onPress={() => setMinutes(m => (m + 15) % 60)}
                      style={styles.upDownBtn}
                    >
                      <Text style={styles.upDownText}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Selected time:</Text>
                <Text style={styles.previewTime}>{getDisplayTime(hours, minutes)}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleTimeConfirm}
                >
                  <Text style={styles.confirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Native implementation
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {displayValue}
        </Text>
        <Text style={styles.icon}>🕐</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={new Date(2024, 0, 1, hours, minutes)}
          mode="time"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowPicker(false);
            }
            if (selectedDate) {
              setHours(selectedDate.getHours());
              setMinutes(selectedDate.getMinutes());
              const timeValue = `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`;
              onChange(timeValue);
            }
          }}
        />
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
  icon: {
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.error || '#d32f2f',
    fontSize: 12,
    marginTop: SPACING.xs,
    ...FONTS.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 12,
    padding: SPACING.lg || 20,
    width: '90%',
    maxWidth: 400,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg || 20,
  },
  timeColumnContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  hoursMinutesContainer: {
    width: 60,
    height: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  upDownBtn: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight || '#e6f4ea',
  },
  upDownText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  timeOption: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  timeOptionSelected: {
    backgroundColor: COLORS.primaryLight || '#e6f4ea',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  previewContainer: {
    backgroundColor: COLORS.primaryLight || '#e6f4ea',
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.border || '#e0e0e0',
  },
  cancelBtnText: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
  },
  confirmBtnText: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default TimeInput;
