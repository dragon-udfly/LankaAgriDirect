import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {COLORS, SPACING, FONTS} from '../../theme/colors';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {registerProducer} from '../../api/authApi';
import {useAuth} from '../../context/AuthContext';

const RegisterScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    address: '',
    nicPhotoUrl: 'https://via.placeholder.com/150', // Placeholder for MVP
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const {signIn} = useAuth();

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Create user and auto-login with response token
      const res = await registerProducer(formData);
      await signIn(res.data);
    } catch (err) {
      setError(err.message || 'Failed to register account');
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Lanka Agri-Direct as a Producer</Text>

          {error && <AlertBox type="error" message={error} style={styles.alert} />}

          <View style={styles.form}>
            <AppInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChangeText={val => setFormData({...formData, name: val})}
              error={fieldErrors.name}
            />
            <AppInput
              label="Phone Number"
              placeholder="07XXXXXXXX"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={val => setFormData({...formData, phoneNumber: val})}
              error={fieldErrors.phoneNumber}
            />
            <AppInput
              label="Address"
              placeholder="e.g. 123 Main St, Colombo"
              value={formData.address}
              onChangeText={val => setFormData({...formData, address: val})}
              error={fieldErrors.address}
            />
            <AppInput
              label="Password"
              placeholder="Create a password"
              isPassword
              value={formData.password}
              onChangeText={val => setFormData({...formData, password: val})}
              error={fieldErrors.password}
            />

            <AppButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Login')}>
                Log in
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textLight,
    marginBottom: SPACING.xxl,
  },
  form: {
    width: '100%',
  },
  alert: {
    marginBottom: SPACING.lg,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...FONTS.body,
    color: COLORS.textLight,
  },
  link: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
