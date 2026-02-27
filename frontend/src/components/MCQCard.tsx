import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MCQCardProps {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  onAnswer: (isCorrect: boolean) => void;
}

export const MCQCard: React.FC<MCQCardProps> = ({ question, options, correctOptionId, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (selectedOption) return; // Prevent multiple clicks
    setSelectedOption(id);
    onAnswer(id === correctOptionId);
  };

  const getOptionStyle = (id: string) => {
    if (!selectedOption) return styles.option;
    if (id === correctOptionId) return [styles.option, styles.correctOption];
    if (id === selectedOption) return [styles.option, styles.wrongOption];
    return styles.option;
  };

  const getOptionTextStyle = (id: string) => {
    if (!selectedOption) return styles.optionText;
    if (id === correctOptionId || id === selectedOption) return [styles.optionText, styles.selectedOptionText];
    return styles.optionText;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={getOptionStyle(opt.id)}
          onPress={() => handleSelect(opt.id)}
          activeOpacity={0.7}
          disabled={!!selectedOption}
        >
          <Text style={getOptionTextStyle(opt.id)}>{opt.id}. {opt.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  wrongOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  optionText: {
    fontSize: 16,
    color: '#495057',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#212529',
  },
});
