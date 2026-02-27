import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, ActivityIndicator, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

// Book emoji colors per class for visual variety
const CLASS_COLORS = ['#e8f5e9', '#e3f2fd', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f7fa'];
const CLASS_ICONS = ['📗', '📘', '📙', '📕', '📒', '📓'];

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);

  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({ accuracy: 0, completed_chapters: 0, total_quizzes: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const dailyAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [statsRes, classesRes] = await Promise.all([
          apiClient.get('/revision/progress/stats').catch(() => ({ data: null })),
          apiClient.get('/classes').catch(() => ({ data: null }))
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (classesRes.data && classesRes.data.length > 0) {
          const formattedClasses = classesRes.data.map((c: any, i: number) => ({
            ...c,
            subjects: c.subjectCount || Math.floor(Math.random() * 3) + 1,
            color: CLASS_COLORS[i % CLASS_COLORS.length],
            icon: CLASS_ICONS[i % CLASS_ICONS.length],
          }));
          setClasses(formattedClasses);
        } else {
          setClasses([
            { id: 1, name: 'Class 6', subjects: 3, color: CLASS_COLORS[0], icon: CLASS_ICONS[0] },
            { id: 2, name: 'Class 7', subjects: 2, color: CLASS_COLORS[1], icon: CLASS_ICONS[1] },
            { id: 3, name: 'Class 8', subjects: 1, color: CLASS_COLORS[2], icon: CLASS_ICONS[2] },
            { id: 4, name: 'Class 9', subjects: 2, color: CLASS_COLORS[3], icon: CLASS_ICONS[3] },
          ]);
        }
      } catch (error) {
        console.log('Error fetching home data:', error);
        setClasses([
          { id: 1, name: 'Class 6', subjects: 3, color: CLASS_COLORS[0], icon: CLASS_ICONS[0] },
          { id: 2, name: 'Class 7', subjects: 2, color: CLASS_COLORS[1], icon: CLASS_ICONS[1] },
          { id: 3, name: 'Class 8', subjects: 1, color: CLASS_COLORS[2], icon: CLASS_ICONS[2] },
          { id: 4, name: 'Class 9', subjects: 2, color: CLASS_COLORS[3], icon: CLASS_ICONS[3] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.stagger(120, [
        Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.spring(statsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.spring(dailyAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
        Animated.spring(gridAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      ]).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

        {/* ─── Green Header ─── */}
        <Animated.View style={[styles.headerBg, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}>
          <SafeAreaView>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.welcomeLabel}>Welcome back 👋</Text>
                <Text style={styles.appTitle}>NCERT Revision</Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={17} color="#f97316" />
                  <Text style={styles.streakValue}>{stats.streak}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.profileAvatarBtn} 
                  onPress={() => navigation.navigate('Profile')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.profileAvatarText}>S</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* ─── Stat Cards (overlapping header) ─── */}
        <Animated.View style={[styles.statsRow, { opacity: statsAnim, transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="checkmark-done-circle" size={22} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>{stats.accuracy}%</Text>
            <Text style={styles.statCaption}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="book" size={22} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>{stats.completed_chapters}</Text>
            <Text style={styles.statCaption}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="flash" size={22} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>{stats.total_quizzes}</Text>
            <Text style={styles.statCaption}>Quizzes</Text>
          </View>
        </Animated.View>

        {/* ─── Daily Smart Revision Card ─── */}
        <Animated.View style={[{ paddingHorizontal: 20, marginBottom: 28 }, { opacity: dailyAnim, transform: [{ translateY: dailyAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          <TouchableOpacity style={styles.dailyCard} activeOpacity={0.85}>
            <View style={styles.dailyIconCircle}>
              <Ionicons name="flame" size={26} color="#f97316" />
            </View>
            <View style={styles.dailyBody}>
              <Text style={styles.dailyHeading}>Daily Smart Revision</Text>
              <Text style={styles.dailySub}>10 questions • Keep your streak</Text>
              <Text style={{ fontSize: 14, marginTop: 2 }}>🔥</Text>
            </View>
            <View style={styles.dailyChevron}>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Select Your Class ─── */}
        <Animated.View style={{ opacity: gridAnim, transform: [{ translateY: gridAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="school" size={18} color="#22c55e" />
            </View>
            <Text style={styles.sectionLabel}>Select Your Class</Text>
          </View>

          <View style={styles.classGrid}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, { borderColor: cls.color }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Subjects', { classId: cls.id })}
              >
                <View style={[styles.classIconWrap, { backgroundColor: cls.color }]}>
                  <Text style={{ fontSize: 22 }}>{cls.icon}</Text>
                </View>
                <Text style={styles.className}>{cls.name}</Text>
                <Text style={styles.classSubCount}>{cls.subjects} subjects</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
};

/* ────────────────────────────── Styles ────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 30,
  },

  /* Header */
  headerBg: {
    backgroundColor: '#22c55e',
    paddingBottom: 50,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 8,
  },
  welcomeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    gap: 5,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileAvatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22c55e',
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -34,
    marginBottom: 22,
  },
  statCard: {
    backgroundColor: '#ffffff',
    width: (width - 56) / 3,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statCaption: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Daily Card */
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  dailyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dailyBody: {
    flex: 1,
  },
  dailyHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  dailySub: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  dailyChevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Section Header */
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  /* Class Grid */
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  classCard: {
    backgroundColor: '#ffffff',
    width: CARD_WIDTH,
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  classIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  classSubCount: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
