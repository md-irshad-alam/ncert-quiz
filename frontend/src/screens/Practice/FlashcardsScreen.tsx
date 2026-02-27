import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export const FlashcardsScreen = () => {
  const route = useRoute<any>();
  const chapterId = route.params?.chapterId;

  const mockCards = [
    { id: 1, question: "What is a rational number?", answer: "A number that can be expressed as the quotient p/q of two integers, where q ≠ 0." },
    { id: 2, question: "Define Euclid's Division Lemma", answer: "Given positive integers a and b, there exist unique integers q and r satisfying a = bq + r, 0 ≤ r < b." },
    { id: 3, question: "What is the Fundamental Theorem of Arithmetic?", answer: "Every composite number can be expressed as a product of primes, and this factorisation is unique." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < mockCards.length - 1) {
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

  const card = mockCards[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>{currentIndex + 1} / {mockCards.length}</Text>

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
          style={[styles.navBtn, styles.navBtnPrimary, currentIndex === mockCards.length - 1 && styles.navBtnDisabled]}
          onPress={handleNext}
          disabled={currentIndex === mockCards.length - 1}
          activeOpacity={0.7}
        >
          <Text style={[styles.navBtnText, { color: currentIndex === mockCards.length - 1 ? '#d1d5db' : '#fff' }]}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={currentIndex === mockCards.length - 1 ? '#d1d5db' : '#fff'} />
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
    backgroundColor: '#22c55e', borderColor: '#22c55e',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 15, fontWeight: '600', color: '#374151',
  },
});
