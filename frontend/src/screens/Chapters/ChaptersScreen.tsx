import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

const MAX_RESETS = 2;

export const ChaptersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const subjectId = route.params?.subjectId;
  const subjectName = route.params?.subjectName || 'Subject';

  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Per-chapter attempt history map: chapterId -> { attempts[], resetCount, resets_remaining }
  const [attemptData, setAttemptData] = useState<Record<number, { attempts: any[]; reset_count: number; resets_remaining: number }>>({});
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [resetting, setResetting] = useState<number | null>(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/chapters/${subjectId}`);
      if (res.data && res.data.length > 0) {
        setChapters(res.data);
      } else {
        setChapters([
          { id: 1, title: 'Real Numbers' },
          { id: 2, title: 'Polynomials' },
          { id: 3, title: 'Pair of Linear Equations' },
        ]);
      }
    } catch {
      setChapters([
        { id: 1, title: 'Real Numbers' },
        { id: 2, title: 'Polynomials' },
        { id: 3, title: 'Pair of Linear Equations' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async (chapterId: number) => {
    try {
      const [attemptsRes, statusRes] = await Promise.all([
        apiClient.get(`/attempts/${chapterId}`),
        apiClient.get(`/attempts/${chapterId}/reset-status`),
      ]);
      setAttemptData(prev => ({
        ...prev,
        [chapterId]: {
          attempts: attemptsRes.data || [],
          reset_count: statusRes.data.reset_count,
          resets_remaining: statusRes.data.resets_remaining,
        },
      }));
    } catch {
      // silently fail
    }
  };

  useEffect(() => { fetchChapters(); }, [subjectId]);

  // Reload attempt data whenever screen comes into focus (e.g. returning from quiz)
  useFocusEffect(
    useCallback(() => {
      chapters.forEach(ch => fetchAttempts(ch.id));
    }, [chapters])
  );

  const handleToggleHistory = (chapterId: number) => {
    const next = expandedChapter === chapterId ? null : chapterId;
    setExpandedChapter(next);
    if (next !== null) fetchAttempts(chapterId);
  };

  const handleReset = (chapterId: number) => {
    const info = attemptData[chapterId];
    if (info && info.resets_remaining <= 0) {
      Alert.alert('Reset Limit Reached', `You've already used all ${MAX_RESETS} resets for this chapter.`);
      return;
    }
    const used = info ? info.reset_count : 0;
    const remaining = info ? info.resets_remaining : MAX_RESETS;
    Alert.alert(
      `Reset Answers (${used}/${MAX_RESETS} used)`,
      `This will clear all your saved answers for this chapter.\n\nYou have ${remaining - 1} reset(s) left after this.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            setResetting(chapterId);
            try {
              await apiClient.delete(`/attempts/${chapterId}/reset`);
              await fetchAttempts(chapterId);
            } catch (e: any) {
              const msg = e?.response?.data?.detail || 'Reset failed.';
              Alert.alert('Error', msg);
            } finally {
              setResetting(null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>{subjectName}</Text>
      <Text style={styles.subheading}>{chapters.length} chapters available</Text>

      {chapters.map((chapter, idx) => {
        const info = attemptData[chapter.id];
        const attempts = info?.attempts || [];
        const resetCount = info?.reset_count ?? 0;
        const resetsRemaining = info?.resets_remaining ?? MAX_RESETS;
        const isExpanded = expandedChapter === chapter.id;
        const score = attempts.filter(a => a.is_correct).length;

        return (
          <View key={chapter.id} style={styles.card}>
            {/* Chapter Header */}
            <View style={styles.cardHeader}>
              <View style={styles.chapterBadge}>
                <Text style={styles.chapterBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.chapterTitle} numberOfLines={2}>{chapter.title}</Text>
              {attempts.length > 0 && (
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillText}>{score}/{attempts.length}</Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.outlineBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Flashcards', { chapterId: chapter.id })}
              >
                <Ionicons name="layers-outline" size={16} color="#6366f1" style={{ marginRight: 6 }} />
                <Text style={styles.outlineBtnText}>Flashcards</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Practice', { chapterId: chapter.id })}
              >
                <Ionicons name="play-circle" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Start Quiz</Text>
              </TouchableOpacity>
            </View>

            {/* History Toggle Button */}
            {attempts.length > 0 && (
              <View style={styles.historyToggle}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  onPress={() => handleToggleHistory(chapter.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16} color="#6b7280"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.historyToggleText}>
                    {isExpanded ? 'Hide' : `View ${attempts.length} Previous Answers`}
                  </Text>
                </TouchableOpacity>
                {/* Reset button with counter badge */}
                <TouchableOpacity
                  onPress={() => handleReset(chapter.id)}
                  style={[
                    styles.resetBtn,
                    resetsRemaining <= 0 && styles.resetBtnDisabled
                  ]}
                  disabled={resetsRemaining <= 0 || resetting === chapter.id}
                >
                  {resetting === chapter.id
                    ? <ActivityIndicator size="small" color="#ef4444" />
                    : <>
                        <Ionicons
                          name="refresh"
                          size={13}
                          color={resetsRemaining <= 0 ? '#d1d5db' : '#ef4444'}
                        />
                        <Text style={[
                          styles.resetBtnText,
                          resetsRemaining <= 0 && { color: '#d1d5db' }
                        ]}>
                          Reset
                        </Text>
                        <View style={[
                          styles.resetCounter,
                          resetsRemaining <= 0 && { backgroundColor: '#e5e7eb' }
                        ]}>
                          <Text style={[
                            styles.resetCounterText,
                            resetsRemaining <= 0 && { color: '#9ca3af' }
                          ]}>
                            {resetCount}/{MAX_RESETS}
                          </Text>
                        </View>
                      </>
                  }
                </TouchableOpacity>
              </View>
            )}


            {/* Expanded Previous Answers List */}
            {isExpanded && attempts.length > 0 && (
              <View style={styles.historyList}>
                {attempts.map((a, qi) => (
                  <View key={a.id} style={[styles.historyItem, a.is_correct ? styles.historyItemCorrect : styles.historyItemWrong]}>
                    <View style={styles.historyItemHeader}>
                      <View style={[styles.historyBadge, a.is_correct ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fef2f2' }]}>
                        <Ionicons
                          name={a.is_correct ? 'checkmark' : 'close'}
                          size={14}
                          color={a.is_correct ? '#16a34a' : '#ef4444'}
                        />
                      </View>
                      <Text style={styles.historyQNum}>Q{qi + 1}</Text>
                    </View>
                    <Text style={styles.historyQuestion} numberOfLines={2}>{a.question}</Text>
                    <View style={styles.historyAnswerRow}>
                      <Text style={styles.historyLabel}>Your answer:</Text>
                      <View style={[
                        styles.historyAnswerBadge,
                        { backgroundColor: a.is_correct ? '#dcfce7' : '#fef2f2' }
                      ]}>
                        <Text style={[
                          styles.historyAnswerText,
                          { color: a.is_correct ? '#16a34a' : '#ef4444' }
                        ]}>
                          {a.selected_answer}
                        </Text>
                      </View>
                      {!a.is_correct && (
                        <>
                          <Text style={[styles.historyLabel, { marginLeft: 8 }]}>Correct:</Text>
                          <View style={[styles.historyAnswerBadge, { backgroundColor: '#dcfce7' }]}>
                            <Text style={[styles.historyAnswerText, { color: '#16a34a' }]}>{a.correct}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  heading: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#9ca3af', marginBottom: 24, fontWeight: '500' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  chapterBadgeText: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  chapterTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', flex: 1 },
  scorePill: {
    backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginLeft: 8,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  scorePillText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },

  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  outlineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e0e7ff', backgroundColor: '#f5f3ff',
  },
  outlineBtnText: { fontSize: 14, fontWeight: '600', color: '#6366f1' },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 11, borderRadius: 12, backgroundColor: '#22c55e',
  },
  primaryBtnText: { fontSize: 14, fontWeight: '600', color: '#ffffff' },

  // History toggle row
  historyToggle: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  historyToggleText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },

  // Reset button
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  resetBtnDisabled: {
    borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  resetBtnText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  resetCounter: {
    backgroundColor: '#ef4444', borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  resetCounterText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // History list
  historyList: { marginTop: 12 },
  historyItem: {
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1,
  },
  historyItemCorrect: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  historyItemWrong: { backgroundColor: '#fff5f5', borderColor: '#fecaca' },
  historyItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  historyBadge: {
    width: 22, height: 22, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  historyQNum: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  historyQuestion: { fontSize: 13, fontWeight: '600', color: '#1f2937', marginBottom: 8, lineHeight: 18 },
  historyAnswerRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  historyLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  historyAnswerBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  historyAnswerText: { fontSize: 12, fontWeight: '700' },
});
