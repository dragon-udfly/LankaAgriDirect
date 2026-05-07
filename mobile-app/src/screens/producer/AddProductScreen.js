import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {createProduct, updateProduct} from '../../api/productApi';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS} from '../../theme/colors';

const CATEGORIES = ['Vegetables', 'Fruits', 'Herbal Products', 'Rice', 'Fish', 'Meat'];
const UNIT_TYPES = ['kg', 'g', 'bundle', 'piece', 'litre', 'dozen'];

const AddProductScreen = ({navigation, route}) => {
  const {user} = useAuth();
  const editProduct = route?.params?.product ?? null;
  const isEdit = !!editProduct;

  const [name, setName] = useState(editProduct?.name ?? '');
  const [category, setCategory] = useState(editProduct?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(editProduct?.description ?? '');
  const [unitPrice, setUnitPrice] = useState(editProduct?.unitPrice?.toString() ?? '');
  const [unitType, setUnitType] = useState(editProduct?.unitType ?? UNIT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!unitPrice.trim()) errs.unitPrice = 'Unit price is required.';
    else if (isNaN(Number(unitPrice)) || Number(unitPrice) <= 0)
      errs.unitPrice = 'Enter a valid price greater than 0.';
    return errs;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        description: description.trim(),
        unitPrice: parseFloat(unitPrice),
        unitType,
      };
      if (isEdit) {
        await updateProduct(editProduct.id, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product created! It is now live on the marketplace.');
        setName(''); setDescription(''); setUnitPrice('');
      }
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      setError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SelectPill = ({options, selected, onSelect, label}) => (
    <View style={styles.pillSection}>
      <Text style={styles.pillLabel}>{label}</Text>
      <View style={styles.pillRow}>
        {options.map(opt => (
          <AppButton
            key={opt}
            title={opt}
            onPress={() => onSelect(opt)}
            variant={selected === opt ? 'primary' : 'outline'}
            fullWidth={false}
            style={styles.pill}
          />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <AlertBox message={error} type="error" />
        <AlertBox message={success} type="success" />

        <AppInput
          label="Product Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fresh Tomatoes"
          error={fieldErrors.name}
        />

        <SelectPill
          label="Category *"
          options={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />

        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your product, quality, variety..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.priceRow}>
          <AppInput
            label="Price (Rs.) *"
            value={unitPrice}
            onChangeText={setUnitPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={fieldErrors.unitPrice}
            style={styles.priceInput}
          />
          <View style={styles.unitSection}>
            <Text style={styles.pillLabel}>Per</Text>
            <View style={styles.pillRow}>
              {UNIT_TYPES.map(ut => (
                <AppButton
                  key={ut}
                  title={ut}
                  onPress={() => setUnitType(ut)}
                  variant={unitType === ut ? 'primary' : 'outline'}
                  fullWidth={false}
                  style={styles.unitPill}
                />
              ))}
            </View>
          </View>
        </View>

        <AppButton
          title={isEdit ? 'Update Product' : 'List Product'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: COLORS.background},
  container: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  pillSection: {marginBottom: SPACING.md},
  pillLabel: {fontSize: 14, ...FONTS.medium, color: COLORS.text, marginBottom: SPACING.sm},
  pillRow: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm},
  pill: {paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, minHeight: 36},
  priceRow: {gap: SPACING.md},
  priceInput: {marginBottom: 0},
  unitSection: {marginBottom: SPACING.md},
  unitPill: {paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, minHeight: 36},
  submitBtn: {marginTop: SPACING.lg},
});

export default AddProductScreen;
