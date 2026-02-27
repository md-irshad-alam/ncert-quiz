import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export const PracticeScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const chapterId = route.params?.chapterId || 1;

  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchMCQs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.post(`/ai/generate-mcq/${chapterId}`);
        if (response.data && response.data.length > 0) {
          const formatted = response.data.map((mcq: any) => ({
            id: mcq.id,
            question: mcq.question,
            options: [
              { id: 'A', text: mcq.option_a },
              { id: 'B', text: mcq.option_b },
              { id: 'C', text: mcq.option_c },
              { id: 'D', text: mcq.option_d },
            ],
            correct: mcq.correct,
          }));
          setMcqs(formatted);
        } else {
          setError('No questions available for this chapter.');
        }
      } catch (err: any) {
        if (err.response?.status === 429) {
          setError(err.response.data?.detail || "You've exceeded today's limit of 5 AI requests. Please try again tomorrow! 🌟");
        } else {
          setError('Failed to generate questions. Check your API key.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMCQs();
  }, [chapterId]);

  const handleSelect = (optId: string) => {
    if (selectedOption) return;
    setSelectedOption(optId);
    if (optId === mcqs[currentIndex].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
      submitProgress();
    }
  };

  const submitProgress = async () => {
    try {
      await apiClient.post('/revision/progress/update', {
        chapter_id: chapterId,
        correct_answers: score,
        total_questions: mcqs.length,
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
        <Text style={styles.loadingTitle}>Generating AI Questions</Text>
        <Text style={styles.loadingSub}>Powered by Google Gemini ✨</Text>
      </View>
    );
  }

  if (error || mcqs.length === 0) {
    const isRateLimit = error?.includes('limit');
    return (
      <View style={styles.center}>
        <View style={[styles.loadingCircle, { backgroundColor: isRateLimit ? '#fff7ed' : '#fef2f2' }]}>
          <Ionicons name={isRateLimit ? "time" : "alert-circle"} size={40} color={isRateLimit ? "#f97316" : "#ef4444"} />
        </View>
        <Text style={styles.loadingTitle}>{isRateLimit ? 'Daily Limit Reached' : 'Oops!'}</Text>
        <Text style={[styles.loadingSub, { textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 }]}>
          {error || 'No questions found'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResult) {
    const pct = Math.round((score / mcqs.length) * 100);
    return (
      <View style={styles.center}>
        <View style={[styles.resultCircle, pct >= 60 ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.resultPct, pct >= 60 ? { color: '#16a34a' } : { color: '#ef4444' }]}>{pct}%</Text>
        </View>
        <Text style={styles.resultTitle}>
          {pct >= 80 ? 'Excellent! 🎉' : pct >= 60 ? 'Good Job! 👍' : 'Keep Practicing! 💪'}
        </Text>
        <Text style={styles.resultSub}>{score} out of {mcqs.length} correct</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.doneBtnText}>Back to Chapters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = mcqs[currentIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((currentIndex + 1) / mcqs.length) * 100}%` }]} />
      </View>

      <Text style={styles.counter}>Question {currentIndex + 1} of {mcqs.length}</Text>
      <Text style={styles.question}>{q.question}</Text>

      {q.options.map((opt: any) => {
        let optStyle = styles.option;
        let optTextStyle = styles.optionText;
        if (selectedOption) {
          if (opt.id === q.correct) {
            optStyle = { ...styles.option, backgroundColor: '#dcfce7', borderColor: '#22c55e' };
            optTextStyle = { ...styles.optionText, color: '#16a34a', fontWeight: '700' };
          } else if (opt.id === selectedOption && opt.id !== q.correct) {
            optStyle = { ...styles.option, backgroundColor: '#fef2f2', borderColor: '#ef4444' };
            optTextStyle = { ...styles.optionText, color: '#ef4444', fontWeight: '700' };
          }
        }
        return (
          <TouchableOpacity
            key={opt.id}
            style={optStyle}
            activeOpacity={0.7}
            disabled={!!selectedOption}
            onPress={() => handleSelect(opt.id)}
          >
            <View style={styles.optionBadge}>
              <Text style={styles.optionBadgeText}>{opt.id}</Text>
            </View>
            <Text style={optTextStyle}>{opt.text}</Text>
            {selectedOption && opt.id === q.correct && (
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" style={{ marginLeft: 'auto' }} />
            )}
            {selectedOption && opt.id === selectedOption && opt.id !== q.correct && (
              <Ionicons name="close-circle" size={20} color="#ef4444" style={{ marginLeft: 'auto' }} />
            )}
          </TouchableOpacity>
        );
      })}

      {selectedOption && (
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.85} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === mcqs.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 30 },

  loadingCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#ecfdf5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  loadingTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' },
  loadingSub: { fontSize: 14, color: '#9ca3af' },
  backBtn: { marginTop: 20, backgroundColor: '#f3f4f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  resultCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  resultPct: { fontSize: 36, fontWeight: '800' },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  resultSub: { fontSize: 16, color: '#6b7280', marginBottom: 32 },
  doneBtn: { backgroundColor: '#22c55e', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 3 },

  counter: { fontSize: 14, fontWeight: '600', color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  question: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24, lineHeight: 28 },

  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
  optionBadge: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  optionBadgeText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  optionText: { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1 },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#22c55e', paddingVertical: 16, borderRadius: 14, marginTop: 12,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
