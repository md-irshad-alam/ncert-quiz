import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');

export const ProgressScreen = () => {
  const [stats, setStats] = useState({ accuracy: 0, completed_chapters: 0, total_quizzes: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get('/revision/progress/stats');
        if (res.data) setStats(res.data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#22c55e" /></View>;
  }

  const cards = [
    { label: 'Accuracy', value: `${stats.accuracy}%`, icon: 'checkmark-done-circle', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Chapters Done', value: `${stats.completed_chapters}`, icon: 'book', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Total Quizzes', value: `${stats.total_quizzes}`, icon: 'flash', color: '#eab308', bg: '#fefce8' },
    { label: 'Streak', value: `${stats.streak} days`, icon: 'flame', color: '#f97316', bg: '#fff7ed' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.sub}>Track your learning journey 📊</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((c, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: c.bg }]}>
              <Ionicons name={c.icon as any} size={24} color={c.color} />
            </View>
            <Text style={styles.cardValue}>{c.value}</Text>
            <Text style={styles.cardLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.motivationCard}>
        <Ionicons name="trophy" size={28} color="#eab308" style={{ marginRight: 14 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.motTitle}>Keep Going!</Text>
          <Text style={styles.motDesc}>
            {stats.streak > 0
              ? `You're on a ${stats.streak}-day streak. Keep practicing to improve your accuracy!`
              : 'Start a quiz to begin tracking your progress!'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 50 : 16,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#9ca3af', fontWeight: '500', marginTop: 4, marginBottom: 20 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff', width: (width - 48) / 2,
    padding: 20, borderRadius: 18, marginBottom: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  cardValue: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  motivationCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fffbeb', marginHorizontal: 20, marginTop: 10,
    padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#fef3c7',
  },
  motTitle: { fontSize: 16, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  motDesc: { fontSize: 13, color: '#a16207', lineHeight: 18 },
});
