import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export const ChaptersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const subjectId = route.params?.subjectId;
  const subjectName = route.params?.subjectName || 'Subject';

  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            { id: 4, title: 'Quadratic Equations' },
            { id: 5, title: 'Arithmetic Progressions' },
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
    fetchChapters();
  }, [subjectId]);

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

      {chapters.map((chapter, idx) => (
        <View key={chapter.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.chapterBadge}>
              <Text style={styles.chapterBadgeText}>{idx + 1}</Text>
            </View>
            <Text style={styles.chapterTitle} numberOfLines={2}>{chapter.title}</Text>
          </View>

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
        </View>
      ))}
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chapterBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    backgroundColor: '#f5f3ff',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
