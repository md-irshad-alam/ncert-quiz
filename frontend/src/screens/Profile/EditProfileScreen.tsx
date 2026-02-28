import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormInput } from '../../components/FormInput';
import { SelectDropdown, SelectOption } from '../../components/SelectDropdown';
import { apiClient } from '../../api/client';

const USER_TYPE_OPTIONS: SelectOption[] = [
  { label: '🎒 Student', value: 'student' },
  { label: '👨‍👩‍👧 Parent', value: 'parent' },
];

export const EditProfileScreen = () => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<SelectOption[]>([]);

  // Form state
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [classId, setClassId] = useState<number | null>(null);
  const [userType, setUserType] = useState<string>('student');
  const [email, setEmail] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
    loadClasses();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const user = res.data;
      setEmail(user.email || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setClassId(user.class_id || null);
      setUserType(user.user_type || 'student');
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await apiClient.get('/classes');
      const formatted: SelectOption[] = res.data.map((c: any) => ({
        label: c.name,
        value: c.id,
      }));
      setClasses(formatted);
    } catch {
      // Fallback class options
      setClasses(
        Array.from({ length: 7 }, (_, i) => ({
          label: `Class ${i + 6}`,
          value: i + 1,
        }))
      );
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (phone && !/^[6-9]\d{9}$/.test(phone)) newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await apiClient.patch('/auth/me', {
        username: username.trim(),
        phone: phone.trim() || null,
        class_id: classId,
        user_type: userType,
      });
      Alert.alert('✅ Saved', 'Your profile has been updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(username || email).charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <Text style={styles.avatarEmail}>{email}</Text>
        </View>

        {/* Section: Personal Info */}
        <Text style={styles.sectionLabel}>Personal Info</Text>
        <View style={styles.section}>
          <FormInput
            label="Username"
            placeholder="e.g. rahul_ncert"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            required
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormInput
            label="Phone Number"
            placeholder="10-digit mobile number"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            keyboardType="number-pad"
            maxLength={10}
          />
          <FormInput
            label="Email"
            value={email}
            editable={false}
            containerStyle={{ opacity: 0.6 }}
          />
        </View>

        {/* Section: Study Info */}
        <Text style={styles.sectionLabel}>Study Details</Text>
        <View style={styles.section}>
          <SelectDropdown
            label="My Class"
            options={classes}
            value={classId}
            onChange={(v) => setClassId(v as number)}
            placeholder="Select your class"
            required
          />
          <SelectDropdown
            label="I Am A"
            options={USER_TYPE_OPTIONS}
            value={userType}
            onChange={(v) => setUserType(v as string)}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnLoading]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Profile</Text>
              </>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#dcfce7', marginBottom: 10,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  avatarEmail: { fontSize: 14, color: '#9ca3af', fontWeight: '500' },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 2,
  },
  section: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#22c55e', borderRadius: 16, paddingVertical: 16,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 5,
    marginTop: 4,
  },
  saveBtnLoading: { backgroundColor: '#86efac' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
