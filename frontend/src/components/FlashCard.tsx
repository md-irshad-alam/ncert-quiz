import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface FlashCardProps {
  question: string;
  answer: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const flipCard = () => {
    Animated.timing(animation, {
      toValue: flipped ? 0 : 180,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  const frontInterpolate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity onPress={flipCard} activeOpacity={0.9} style={styles.container}>
      {/* Front */}
      <Animated.View style={[styles.card, frontAnimatedStyle, flipped && styles.hidden]}>
        <Text style={styles.title}>Question</Text>
        <Text style={styles.content}>{question}</Text>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, !flipped && styles.hidden]}>
        <Text style={styles.title}>Answer</Text>
        <Text style={styles.content}>{answer}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.5,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    backfaceVisibility: 'hidden',
    position: 'absolute',
  },
  cardBack: {
    backgroundColor: '#f8f9fa',
  },
  hidden: {
    opacity: 0,
  },
  title: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    fontSize: 18,
    color: '#212529',
    textAlign: 'center',
    fontWeight: '500',
  },
});
