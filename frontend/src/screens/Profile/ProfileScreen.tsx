import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('student');

  const loadProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setEmail(res.data.email || '');
      setUsername(res.data.username || '');
      setUserType(res.data.user_type || 'student');
    } catch {}
  };

  useEffect(() => { loadProfile(); }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:support@ncertrevision.com').catch(() => {
      Alert.alert("Contact Us", "Reach out to us at support@ncertrevision.com");
    });
  };

  const firstLetter = (username || email).charAt(0).toUpperCase() || 'S';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
          <Text style={styles.userName}>{username || 'Student Account'}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <View style={styles.badgeContainer}>
            <Ionicons name="shield-checkmark" size={14} color="#22c55e" />
            <Text style={styles.badgeText}>{userType === 'parent' ? '👨‍👩‍👧 Parent' : '🎒 Student'}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsGroup}>

          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('EditProfile')}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="person" size={20} color="#22c55e" />
              </View>
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem} onPress={handleContactUs}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="mail" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.settingText}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.settingText}>App Version</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>

        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>Made with ❤️ for NCERT Students</Text>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#dcfce7',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  versionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 40,
  },
});
