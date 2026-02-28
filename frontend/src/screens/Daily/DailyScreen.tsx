import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Platform,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../api/client';

export const DailyScreen = () => {
  const navigation = useNavigation<any>();

  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userClass, setUserClass] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const user = res.data;
      if (!user.class_id) {
        setProfileIncomplete(true);
      } else {
        // Find class label from /classes list
        const classRes = await apiClient.get('/classes');
        const found = classRes.data.find((c: any) => c.id === user.class_id);
        setUserClass(found?.name || `Class ${user.class_id}`);
      }
    } catch {
      // proceed without class info
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/revision/daily');
      if (!res.data || res.data.length === 0) {
        Alert.alert(
          'No Questions Available',
          'Complete a chapter quiz first to populate the question pool, then come back!',
          [{ text: 'OK' }]
        );
        return;
      }
      setMcqs(res.data);
      setQuizStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setShowResult(false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Failed to load daily quiz. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optId: string) => {
    if (selectedOption) return;
    setSelectedOption(optId);
    if (optId === mcqs[currentIndex].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setShowResult(false);
    setMcqs([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
  };

  // ── Lobby screen (before quiz starts) ─────────────────────────────
  if (!quizStarted) {
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

          {userClass ? (
            <View style={styles.classPill}>
              <Ionicons name="school" size={14} color="#6366f1" style={{ marginRight: 6 }} />
              <Text style={styles.classPillText}>{userClass} questions</Text>
            </View>
          ) : null}

          <Text style={styles.heroSub}>10 MCQ questions from your class topics</Text>

          {profileIncomplete && (
            <TouchableOpacity
              style={styles.incompleteCard}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.8}
            >
              <Ionicons name="warning" size={20} color="#f97316" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.incompleteTitle}>Complete Your Profile</Text>
                <Text style={styles.incompleteSub}>Set your class to get targeted questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#f97316" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.startBtn, loading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleStartQuiz}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              : <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            }
            <Text style={styles.startBtnText}>{loading ? 'Loading...' : 'Start Daily Quiz'}</Text>
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
  }

  // ── Result screen ──────────────────────────────────────────────────
  if (showResult) {
    const pct = Math.round((score / mcqs.length) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.centerContent, { paddingTop: 60 }]}>
          <View style={[styles.resultCircle, { backgroundColor: pct >= 60 ? '#dcfce7' : '#fef2f2' }]}>
            <Text style={[styles.resultPct, { color: pct >= 60 ? '#16a34a' : '#ef4444' }]}>{pct}%</Text>
          </View>
          <Text style={styles.heroText}>
            {pct >= 80 ? 'Outstanding! 🎉' : pct >= 60 ? 'Good Job! 👍' : 'Keep Practicing! 💪'}
          </Text>
          <Text style={styles.heroSub}>{score} out of {mcqs.length} correct</Text>
          <TouchableOpacity style={styles.startBtn} onPress={handleReset} activeOpacity={0.85}>
            <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.startBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Active quiz ────────────────────────────────────────────────────
  const q = mcqs[currentIndex];
  const options = [
    { id: 'A', text: q.option_a },
    { id: 'B', text: q.option_b },
    { id: 'C', text: q.option_c },
    { id: 'D', text: q.option_d },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Q{currentIndex + 1}/{mcqs.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / mcqs.length) * 100}%` as any }]} />
          </View>
          <Text style={styles.progressScore}>🔥 {score}</Text>
        </View>

        <Text style={styles.question}>{q.question}</Text>

        {options.map(opt => {
          let btnStyle = styles.option;
          let txtStyle = styles.optionText;
          if (selectedOption) {
            if (opt.id === q.correct) btnStyle = { ...styles.option, backgroundColor: '#dcfce7', borderColor: '#22c55e' } as any;
            else if (opt.id === selectedOption) btnStyle = { ...styles.option, backgroundColor: '#fef2f2', borderColor: '#ef4444' } as any;
          }
          return (
            <TouchableOpacity
              key={opt.id}
              style={btnStyle}
              onPress={() => handleSelect(opt.id)}
              disabled={!!selectedOption}
              activeOpacity={0.7}
            >
              <View style={styles.optionBadge}>
                <Text style={styles.optionBadgeText}>{opt.id}</Text>
              </View>
              <Text style={txtStyle} numberOfLines={3}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}

        {selectedOption && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>
              {currentIndex === mcqs.length - 1 ? 'Finish Quiz' : 'Next →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 50 : 16,
    paddingBottom: 10,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#9ca3af', fontWeight: '500', marginTop: 4 },

  centerContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingBottom: 40,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 6, marginBottom: 24,
  },
  heroText: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  classPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e0e7ff', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginBottom: 12,
  },
  classPillText: { fontSize: 13, fontWeight: '700', color: '#4338ca' },

  incompleteCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff7ed', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#fed7aa', marginBottom: 20, width: '100%',
  },
  incompleteTitle: { fontSize: 14, fontWeight: '700', color: '#c2410c' },
  incompleteSub: { fontSize: 12, color: '#ea580c', marginTop: 2 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 5, marginBottom: 28,
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

  // Result
  resultCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  resultPct: { fontSize: 36, fontWeight: '800' },

  // Quiz
  quizContent: { padding: 20, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#9ca3af', width: 50 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 3 },
  progressScore: { fontSize: 14, fontWeight: '700', color: '#f97316', width: 36 },

  question: { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 20, lineHeight: 27 },

  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 10,
  },
  optionBadge: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  optionBadgeText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  optionText: { fontSize: 14, color: '#374151', fontWeight: '500', flex: 1 },

  nextBtn: {
    backgroundColor: '#22c55e', paddingVertical: 15, borderRadius: 14,
    alignItems: 'center', marginTop: 8,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
