import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const DailyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Revision</Text>
        <Text style={styles.sub}>Keep your streak going 🔥</Text>
      </View>

      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="flame" size={52} color="#f97316" />
        </View>
        <Text style={styles.heroText}>Ready for today's challenge?</Text>
        <Text style={styles.heroSub}>10 AI-generated questions from your recent topics</Text>

        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85}>
          <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.startBtnText}>Start Daily Quiz</Text>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={20} color="#eab308" />
          </View>
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipDesc}>Complete your daily quiz to maintain your streak and improve accuracy!</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 22, paddingTop: Platform.OS === 'android' ? 50 : 16, paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#9ca3af', fontWeight: '500', marginTop: 4 },
  centerContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 60,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6, marginBottom: 28,
  },
  heroText: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e',
    paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 5, marginBottom: 36,
  },
  startBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  tipCard: {
    flexDirection: 'row', backgroundColor: '#fffbeb',
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fef3c7', width: '100%',
  },
  tipIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef9c3',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  tipBody: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 4 },
  tipDesc: { fontSize: 13, color: '#a16207', lineHeight: 18 },
});
