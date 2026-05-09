import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {login} from '../../api/authApi';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS} from '../../theme/colors';

const LoginScreen = ({navigation}) => {
  const {signIn} = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    if (!loginId.trim() || !password.trim()) {
      setError('Please enter your login ID and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login({loginId: loginId.trim(), password});
      await signIn(res.data);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.appName}>Lanka Agri-Direct</Text>
          <Text style={styles.tagline}>
            Fresh from the farm, direct to you
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in with your NIC, email, or phone number
          </Text>

          <AlertBox message={error} type="error" />

          <AppInput
            label="NIC / Email / Phone"
            value={loginId}
            onChangeText={setLoginId}
            placeholder="Enter NIC, email or phone"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <AppButton title="Sign In" onPress={handleLogin} loading={loading} />

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              New farmer?{' '}
              <Text style={styles.registerBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>

          <AppButton
            title="Browse Products"
            variant="accent-outline"
            onPress={() => navigation.navigate('BuyerTabs')}
            style={styles.browseButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: COLORS.background},
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {alignItems: 'center', marginBottom: SPACING.xl},
  logo: {fontSize: 56, marginBottom: SPACING.sm},
  appName: {
    fontSize: 28,
    ...FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    ...FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  registerLink: {marginTop: SPACING.md, alignItems: 'center'},
  registerText: {fontSize: 14, color: COLORS.textSecondary},
  registerBold: {color: COLORS.primary, ...FONTS.semiBold},
  browseButton: {marginTop: SPACING.xl},
});

export default LoginScreen;
