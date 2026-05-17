import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {COLORS, SPACING, FONTS, RADIUS, SHADOW} from '../../theme/colors';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import AlertBox from '../../components/AlertBox';
import {registerProducer} from '../../api/authApi';
import {uploadImage} from '../../api/cloudinaryUpload';
import Geolocation from '@react-native-community/geolocation';

// Web-compatible image picker helper
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

// Native image picker helper
const pickImageNative = async () => {
  const {launchImageLibrary} = require('react-native-image-picker');
  return new Promise((resolve, reject) => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel) {
        reject(new Error('Cancelled'));
      } else if (response.errorCode) {
        reject(new Error(response.errorMessage));
      } else {
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

const RegisterScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nic: '',
    businessPhone: '',
    email: '',
    storeTitle: '',
    operatingDays: '',
    startTime: '',
    endTime: '',
    homeAddress: '',
    district: '',
    province: '',
    gnDivision: '',
    businessType: 'small-scale',
    password: '',
    latitude: null,
    longitude: null,
    nicPhotoUrl: '',
    profilePictureUrl: '',
  });

  // Image preview URIs (local)
  const [profilePreview, setProfilePreview] = useState(null);
  const [nicFrontPreview, setNicFrontPreview] = useState(null);
  const [nicRearPreview, setNicRearPreview] = useState(null);

  // Uploaded Cloudinary URLs
  const [nicFrontUrl, setNicFrontUrl] = useState(null);
  const [nicRearUrl, setNicRearUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingNicFront, setUploadingNicFront] = useState(false);
  const [uploadingNicRear, setUploadingNicRear] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        alert('Location acquired successfully!');
      },
      error => {
        alert('Error getting location: ' + error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const handlePickProfilePicture = async () => {
    try {
      setUploadingProfile(true);
      const result = await pickImage();
      setProfilePreview(result.previewUri);
      const url = await uploadImage(Platform.OS === 'web' ? result.file : result.file);
      setFormData(prev => ({...prev, profilePictureUrl: url}));
    } catch (err) {
      if (err.message !== 'Cancelled' && err.message !== 'No file selected') {
        alert('Failed to upload profile picture: ' + err.message);
      }
    } finally {
      setUploadingProfile(false);
    }
  };

  const handlePickNicFront = async () => {
    try {
      setUploadingNicFront(true);
      const result = await pickImage();
      setNicFrontPreview(result.previewUri);
      const url = await uploadImage(Platform.OS === 'web' ? result.file : result.file);
      setNicFrontUrl(url);
    } catch (err) {
      if (err.message !== 'Cancelled' && err.message !== 'No file selected') {
        alert('Failed to upload NIC front: ' + err.message);
      }
    } finally {
      setUploadingNicFront(false);
    }
  };

  const handlePickNicRear = async () => {
    try {
      setUploadingNicRear(true);
      const result = await pickImage();
      setNicRearPreview(result.previewUri);
      const url = await uploadImage(Platform.OS === 'web' ? result.file : result.file);
      setNicRearUrl(url);
    } catch (err) {
      if (err.message !== 'Cancelled' && err.message !== 'No file selected') {
        alert('Failed to upload NIC rear: ' + err.message);
      }
    } finally {
      setUploadingNicRear(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const daysArray = formData.operatingDays
        ? formData.operatingDays.split(',').map(day => day.trim()).filter(day => day.length > 0)
        : [];

      // Build NIC photo URL array
      const nicPhotos = [];
      if (nicFrontUrl) nicPhotos.push(nicFrontUrl);
      if (nicRearUrl) nicPhotos.push(nicRearUrl);

      const payload = {
        ...formData,
        operatingDays: daysArray,
        nicPhotoUrl: nicPhotos.length > 0 ? JSON.stringify(nicPhotos) : '',
      };

      await registerProducer(payload);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register account');
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const wrapperProps = Platform.OS === 'web'
    ? {style: styles.webWrapper}
    : {style: styles.container, behavior: 'padding'};

  return (
    <Wrapper {...wrapperProps}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? {flex: 1} : undefined}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Lanka Agri-Direct as a Producer</Text>

        {error && <AlertBox type="error" message={error} style={styles.alert} />}
        {success && <AlertBox type="success" message={success} style={styles.alert} />}

        <View style={styles.form}>
          {/* Profile Picture */}
          <View style={styles.profilePicSection}>
            <TouchableOpacity onPress={handlePickProfilePicture} style={styles.profilePicWrapper}>
              {profilePreview ? (
                <Image source={{uri: profilePreview}} style={styles.profilePic} />
              ) : (
                <View style={styles.profilePicPlaceholder}>
                  <Text style={styles.profilePicIcon}>📷</Text>
                  <Text style={styles.profilePicText}>Add Photo</Text>
                </View>
              )}
              {uploadingProfile && (
                <View style={styles.uploadOverlay}>
                  <Text style={styles.uploadOverlayText}>Uploading...</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.profilePicLabel}>Profile Picture</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={val => setField('firstName', val)}
                error={fieldErrors.firstName}
              />
            </View>
            <View style={styles.halfInput}>
              <AppInput
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={val => setField('lastName', val)}
                error={fieldErrors.lastName}
              />
            </View>
          </View>

          <AppInput
            label="NIC"
            placeholder="e.g. 123456789V"
            value={formData.nic}
            onChangeText={val => setField('nic', val)}
            error={fieldErrors.nic}
          />

          {/* NIC Image Upload */}
          <Text style={styles.label}>NIC Photos</Text>
          <View style={styles.nicPhotoRow}>
            <TouchableOpacity style={styles.nicPhotoBox} onPress={handlePickNicFront}>
              {nicFrontPreview ? (
                <Image source={{uri: nicFrontPreview}} style={styles.nicPhotoImage} />
              ) : (
                <View style={styles.nicPhotoPlaceholder}>
                  <Text style={styles.nicPhotoIcon}>🪪</Text>
                  <Text style={styles.nicPhotoLabel}>Front</Text>
                </View>
              )}
              {uploadingNicFront && (
                <View style={styles.uploadOverlay}>
                  <Text style={styles.uploadOverlayText}>...</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.nicPhotoBox} onPress={handlePickNicRear}>
              {nicRearPreview ? (
                <Image source={{uri: nicRearPreview}} style={styles.nicPhotoImage} />
              ) : (
                <View style={styles.nicPhotoPlaceholder}>
                  <Text style={styles.nicPhotoIcon}>🪪</Text>
                  <Text style={styles.nicPhotoLabel}>Rear</Text>
                </View>
              )}
              {uploadingNicRear && (
                <View style={styles.uploadOverlay}>
                  <Text style={styles.uploadOverlayText}>...</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <AppInput
            label="Business Phone"
            placeholder="07XXXXXXXX"
            keyboardType="phone-pad"
            value={formData.businessPhone}
            onChangeText={val => setField('businessPhone', val)}
            error={fieldErrors.businessPhone}
          />

          <AppInput
            label="Email (Optional)"
            placeholder="john@example.com"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={val => setField('email', val)}
            error={fieldErrors.email}
          />

          <AppInput
            label="Store Title"
            placeholder="e.g. John's Farm"
            value={formData.storeTitle}
            onChangeText={val => setField('storeTitle', val)}
            error={fieldErrors.storeTitle}
          />

          <AppInput
            label="Operating Days (Comma separated)"
            placeholder="e.g. Mon, Tue, Wed"
            value={formData.operatingDays}
            onChangeText={val => setField('operatingDays', val)}
            error={fieldErrors.operatingDays}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput
                label="Start Time"
                placeholder="e.g. 08:00 AM"
                value={formData.startTime}
                onChangeText={val => setField('startTime', val)}
                error={fieldErrors.startTime}
              />
            </View>
            <View style={styles.halfInput}>
              <AppInput
                label="End Time"
                placeholder="e.g. 05:00 PM"
                value={formData.endTime}
                onChangeText={val => setField('endTime', val)}
                error={fieldErrors.endTime}
              />
            </View>
          </View>

          <AppInput
            label="Home Address"
            placeholder="e.g. 123 Main St"
            value={formData.homeAddress}
            onChangeText={val => setField('homeAddress', val)}
            error={fieldErrors.homeAddress}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <AppInput
                label="District"
                placeholder="e.g. Colombo"
                value={formData.district}
                onChangeText={val => setField('district', val)}
                error={fieldErrors.district}
              />
            </View>
            <View style={styles.halfInput}>
              <AppInput
                label="Province"
                placeholder="e.g. Western"
                value={formData.province}
                onChangeText={val => setField('province', val)}
                error={fieldErrors.province}
              />
            </View>
          </View>

          <AppInput
            label="GN Division"
            placeholder="e.g. Kollupitiya"
            value={formData.gnDivision}
            onChangeText={val => setField('gnDivision', val)}
            error={fieldErrors.gnDivision}
          />

          <Text style={styles.label}>Business Type</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioBtn,
                formData.businessType === 'small-scale' && styles.radioBtnActive,
              ]}
              onPress={() => setField('businessType', 'small-scale')}>
              <Text
                style={[
                  styles.radioText,
                  formData.businessType === 'small-scale' && styles.radioTextActive,
                ]}>
                Small Scale
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioBtn,
                formData.businessType === 'home-gardener' && styles.radioBtnActive,
              ]}
              onPress={() => setField('businessType', 'home-gardener')}>
              <Text
                style={[
                  styles.radioText,
                  formData.businessType === 'home-gardener' && styles.radioTextActive,
                ]}>
                Home Gardener
              </Text>
            </TouchableOpacity>
          </View>
          {fieldErrors.businessType && (
            <Text style={styles.errorText}>{fieldErrors.businessType}</Text>
          )}

          <Text style={styles.label}>Location</Text>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              {formData.latitude && formData.longitude
                ? `Lat: ${formData.latitude.toFixed(4)}, Lng: ${formData.longitude.toFixed(4)}`
                : 'Location not set'}
            </Text>
            <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
              <Text style={styles.locationBtnText}>Get Current Location</Text>
            </TouchableOpacity>
          </View>
          {(fieldErrors.latitude || fieldErrors.longitude) && (
            <Text style={styles.errorText}>Location is required</Text>
          )}

          <AppInput
            label="Password"
            placeholder="Create a password"
            secureTextEntry
            value={formData.password}
            onChangeText={val => setField('password', val)}
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
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webWrapper: {
    height: '100vh',
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: 60,
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
  // Profile picture
  profilePicSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  profilePicWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  profilePicPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicIcon: {
    fontSize: 28,
  },
  profilePicText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profilePicLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    ...FONTS.medium,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOverlayText: {
    color: COLORS.white,
    fontSize: 12,
    ...FONTS.semiBold,
  },
  // NIC photos
  nicPhotoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  nicPhotoBox: {
    flex: 1,
    height: 100,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  nicPhotoImage: {
    width: '100%',
    height: '100%',
  },
  nicPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicPhotoIcon: {
    fontSize: 28,
  },
  nicPhotoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    ...FONTS.medium,
  },
  // Rest
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  label: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  radioBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  radioBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight || '#e6f4ea',
  },
  radioText: {
    ...FONTS.body,
    color: COLORS.textLight,
  },
  radioTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  locationText: {
    ...FONTS.body,
    color: COLORS.text,
    flex: 1,
  },
  locationBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
  },
  locationBtnText: {
    color: COLORS.white,
    ...FONTS.body,
    fontWeight: '600',
    fontSize: 12,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  alert: {
    marginBottom: SPACING.lg,
  },
  submitBtn: {
    marginTop: SPACING.lg,
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
