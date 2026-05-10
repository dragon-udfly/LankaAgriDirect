import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {getMyProfile, updateProfile, deleteAccount} from '../../api/authApi';
import {uploadImage} from '../../api/cloudinaryUpload';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {COLORS, FONTS, SPACING, RADIUS, SHADOW} from '../../theme/colors';

// Web-compatible image picker
const pickImageWeb = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        resolve({file, previewUri: URL.createObjectURL(file)});
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
};

const pickImageNative = async () => {
  const {launchImageLibrary} = require('react-native-image-picker');
  return new Promise((resolve, reject) => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel) reject(new Error('Cancelled'));
      else if (response.errorCode) reject(new Error(response.errorMessage));
      else {
        const asset = response.assets[0];
        resolve({
          file: {uri: asset.uri, type: asset.type, fileName: asset.fileName},
          previewUri: asset.uri,
        });
      }
    });
  });
};

const pickImage = Platform.OS === 'web' ? pickImageWeb : pickImageNative;

const AccountSettingsScreen = ({navigation}) => {
  const {user, signOut, refreshUser} = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessPhone: '',
    mobilePhone: '',
    email: '',
    storeTitle: '',
    operatingDays: '',
    startTime: '',
    endTime: '',
    homeAddress: '',
    storeAddress: '',
    profilePictureUrl: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profilePreview, setProfilePreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMe();
      const d = res.data;
      setFormData({
        firstName: d.firstName || d.name?.split(' ')[0] || '',
        lastName: d.lastName || d.name?.split(' ').slice(1).join(' ') || '',
        businessPhone: d.businessPhone || '',
        mobilePhone: d.mobilePhone || '',
        email: d.email || '',
        storeTitle: d.storeTitle || '',
        operatingDays: Array.isArray(d.operatingDays) ? d.operatingDays.join(', ') : (d.operatingDays || ''),
        startTime: d.startTime || '',
        endTime: d.endTime || '',
        homeAddress: d.homeAddress || '',
        storeAddress: d.storeAddress || '',
        profilePictureUrl: d.profilePictureUrl || '',
      });
      if (d.profilePictureUrl) setProfilePreview(d.profilePictureUrl);
    } catch (err) {
      setError('Could not load profile. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const setField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleChangePhoto = async () => {
    try {
      setUploadingPhoto(true);
      const result = await pickImage();
      setProfilePreview(result.previewUri);
      const url = await uploadImage(Platform.OS === 'web' ? result.file : result.file);
      setFormData(prev => ({...prev, profilePictureUrl: url}));
    } catch (err) {
      if (err.message !== 'Cancelled' && err.message !== 'No file selected') {
        alert('Failed to upload photo: ' + err.message);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Password validation
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessPhone: formData.businessPhone,
        mobilePhone: formData.mobilePhone,
        email: formData.email,
        storeTitle: formData.storeTitle,
        operatingDays: formData.operatingDays
          ? formData.operatingDays.split(',').map(d => d.trim()).filter(d => d)
          : [],
        startTime: formData.startTime,
        endTime: formData.endTime,
        homeAddress: formData.homeAddress,
        storeAddress: formData.storeAddress,
        profilePictureUrl: formData.profilePictureUrl,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      await updateProfile(payload);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    const doDelete = async () => {
      setDeleting(true);
      try {
        await deleteAccount();
        await signOut();
      } catch (err) {
        setError(err.message || 'Failed to delete account.');
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Delete', style: 'destructive', onPress: doDelete},
        ],
      );
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarWrapper}>
            {profilePreview ? (
              <Image source={{uri: profilePreview}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
            {uploadingPhoto && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color={COLORS.white} size="small" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {error && <AlertBox type="error" message={error} style={styles.alertBox} />}
        {success && <AlertBox type="success" message={success} style={styles.alertBox} />}

        {/* Personal Info */}
        <View style={[styles.card, SHADOW.sm]}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput label="First Name" value={formData.firstName} onChangeText={v => setField('firstName', v)} />
            </View>
            <View style={styles.halfInput}>
              <AppInput label="Last Name" value={formData.lastName} onChangeText={v => setField('lastName', v)} />
            </View>
          </View>

          <AppInput label="Business Phone" value={formData.businessPhone} onChangeText={v => setField('businessPhone', v)} keyboardType="phone-pad" />
          <AppInput label="Mobile Phone" value={formData.mobilePhone} onChangeText={v => setField('mobilePhone', v)} keyboardType="phone-pad" />
          <AppInput label="Email" value={formData.email} onChangeText={v => setField('email', v)} keyboardType="email-address" />
        </View>

        {/* Store Info */}
        <View style={[styles.card, SHADOW.sm]}>
          <Text style={styles.cardTitle}>Store Information</Text>
          <AppInput label="Store Title" value={formData.storeTitle} onChangeText={v => setField('storeTitle', v)} />
          <AppInput label="Operating Days" value={formData.operatingDays} onChangeText={v => setField('operatingDays', v)} placeholder="Mon, Tue, Wed" />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput label="Start Time" value={formData.startTime} onChangeText={v => setField('startTime', v)} />
            </View>
            <View style={styles.halfInput}>
              <AppInput label="End Time" value={formData.endTime} onChangeText={v => setField('endTime', v)} />
            </View>
          </View>
          <AppInput label="Home Address" value={formData.homeAddress} onChangeText={v => setField('homeAddress', v)} />
          <AppInput label="Store Address" value={formData.storeAddress} onChangeText={v => setField('storeAddress', v)} />
        </View>

        {/* Password */}
        <View style={[styles.card, SHADOW.sm]}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.cardSubtitle}>Leave blank to keep your current password.</Text>
          <AppInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Enter new password" />
          <AppInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm new password" />
        </View>

        {/* Save */}
        <AppButton title="Save Changes" onPress={handleSave} loading={saving} style={styles.saveBtn} />

        {/* Danger Zone */}
        <View style={[styles.dangerCard, SHADOW.sm]}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <AppButton
            title="Delete My Account"
            variant="danger"
            onPress={handleDeleteAccount}
            loading={deleting}
            style={styles.dangerBtn}
          />
          <AppButton
            title="Sign Out"
            variant="outline"
            onPress={signOut}
            style={styles.signOutBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: COLORS.background},
  container: {padding: SPACING.lg, paddingBottom: SPACING.xxl},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background},
  // Photo section
  photoSection: {alignItems: 'center', marginBottom: SPACING.lg},
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  avatar: {width: '100%', height: '100%'},
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {fontSize: 36, color: COLORS.primary, ...FONTS.bold},
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  editBadgeText: {fontSize: 14},
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {fontSize: 12, color: COLORS.textSecondary, marginTop: SPACING.xs},
  alertBox: {marginBottom: SPACING.md},
  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {fontSize: 16, ...FONTS.semiBold, color: COLORS.text, marginBottom: SPACING.sm},
  cardSubtitle: {fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md},
  row: {flexDirection: 'row', justifyContent: 'space-between'},
  halfInput: {width: '48%'},
  saveBtn: {marginBottom: SPACING.lg},
  // Danger zone
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {fontSize: 16, ...FONTS.semiBold, color: COLORS.error, marginBottom: SPACING.md},
  dangerBtn: {marginBottom: SPACING.sm},
  signOutBtn: {marginTop: SPACING.xs},
});

export default AccountSettingsScreen;
