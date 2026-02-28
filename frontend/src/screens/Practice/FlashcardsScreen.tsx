import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

export const FlashcardsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const chapterId = route.params?.chapterId || 1;

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Try to load existing flashcards from the database (no AI call)
        const existing = await apiClient.get(`/flashcards/${chapterId}`);
        if (existing.data && existing.data.length > 0) {
          setCards(existing.data);
          return; // ✅ Data found, no AI needed
        }

        // Step 2: No existing data — trigger AI generation (uses quota)
        const response = await apiClient.post(`/ai/generate-flashcard/${chapterId}`);
        if (response.data && response.data.length > 0) {
          setCards(response.data);
        } else {
          setError('No flashcards available for this chapter.');
        }
      } catch (err: any) {
        if (err.response?.status === 429) {
          setError(err.response.data?.detail || "You've exceeded today's limit of 5 AI requests. Please try again tomorrow! 🌟");
        } else {
          setError('Failed to load flashcards. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [chapterId]);


  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
        <Text style={styles.loadingTitle}>Generating AI Flashcards</Text>
        <Text style={styles.loadingSub}>Powered by Google Gemini ✨</Text>
      </View>
    );
  }

  if (error || cards.length === 0) {
    const isRateLimit = error?.includes('limit');
    return (
      <View style={styles.center}>
        <View style={[styles.loadingCircle, { backgroundColor: isRateLimit ? '#fff7ed' : '#fef2f2' }]}>
          <Ionicons name={isRateLimit ? "time" : "alert-circle"} size={40} color={isRateLimit ? "#f97316" : "#ef4444"} />
        </View>
        <Text style={styles.loadingTitle}>{isRateLimit ? 'Daily Limit Reached' : 'Oops!'}</Text>
        <Text style={[styles.loadingSub, { textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 }]}>
          {error || 'No flashcards found'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const card = cards[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>{currentIndex + 1} / {cards.length}</Text>

      <TouchableOpacity
        style={[styles.card, isFlipped && styles.cardFlipped]}
        activeOpacity={0.9}
        onPress={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <>
            <View style={styles.cardLabel}>
              <Ionicons name="help-circle" size={18} color="#6366f1" />
              <Text style={styles.cardLabelText}>Question</Text>
            </View>
            <Text style={styles.cardContent}>{card.question}</Text>
            <Text style={styles.tapHint}>Tap to reveal answer</Text>
          </>
        ) : (
          <>
            <View style={styles.cardLabel}>
              <Ionicons name="bulb" size={18} color="#16a34a" />
              <Text style={[styles.cardLabelText, { color: '#16a34a' }]}>Answer</Text>
            </View>
            <Text style={styles.cardContent}>{card.answer}</Text>
            <Text style={styles.tapHint}>Tap to see question</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={currentIndex === 0 ? '#d1d5db' : '#374151'} />
          <Text style={[styles.navBtnText, currentIndex === 0 && { color: '#d1d5db' }]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary, currentIndex === cards.length - 1 && styles.navBtnDisabled]}
          onPress={handleNext}
          disabled={currentIndex === cards.length - 1}
          activeOpacity={0.7}
        >
          <Text style={[styles.navBtnText, { color: currentIndex === cards.length - 1 ? '#d1d5db' : '#fff' }]}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={currentIndex === cards.length - 1 ? '#d1d5db' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f8fafc', padding: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingCircle: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#e0e7ff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  loadingTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6, textAlign: 'center' },
  loadingSub: { fontSize: 14, color: '#9ca3af' },
  backBtn: { marginTop: 20, backgroundColor: '#f3f4f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  counter: {
    fontSize: 14, fontWeight: '700', color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 28,
  },
  card: {
    width: '100%', minHeight: 280, backgroundColor: '#ffffff',
    borderRadius: 24, padding: 28,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 5,
    borderWidth: 1.5, borderColor: '#e0e7ff',
    justifyContent: 'center',
  },
  cardFlipped: {
    borderColor: '#bbf7d0', shadowColor: '#22c55e',
  },
  cardLabel: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 18,
  },
  cardLabelText: {
    fontSize: 13, fontWeight: '700', color: '#6366f1',
    marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardContent: {
    fontSize: 20, fontWeight: '600', color: '#111827',
    lineHeight: 30, textAlign: 'center',
  },
  tapHint: {
    fontSize: 12, color: '#d1d5db', fontWeight: '500',
    textAlign: 'center', marginTop: 24,
  },
  controls: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginTop: 36, gap: 12,
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 6,
    backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  navBtnPrimary: {
    backgroundColor: '#6366f1', borderColor: '#6366f1',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 15, fontWeight: '600', color: '#374151',
  },
});
