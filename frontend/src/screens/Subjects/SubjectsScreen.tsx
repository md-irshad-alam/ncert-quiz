import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

const SUBJECT_THEME: Record<string, { icon: string; color: string; bg: string }> = {
  'Mathematics': { icon: '📐', color: '#3b82f6', bg: '#eff6ff' },
  'Science':     { icon: '🔬', color: '#10b981', bg: '#ecfdf5' },
  'English':     { icon: '📝', color: '#8b5cf6', bg: '#f5f3ff' },
  'Hindi':       { icon: '🔤', color: '#f59e0b', bg: '#fffbeb' },
  'Social Science': { icon: '🌍', color: '#ef4444', bg: '#fef2f2' },
  'History':     { icon: '🏛️', color: '#ef4444', bg: '#fef2f2' },
  'Geography':   { icon: '🗺️', color: '#06b6d4', bg: '#ecfeff' },
  'default':     { icon: '📖', color: '#6366f1', bg: '#eef2ff' },
};

function getTheme(name: string) {
  return SUBJECT_THEME[name] || SUBJECT_THEME['default'];
}

export const SubjectsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const classId = route.params?.classId;

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/subjects/${classId}`);
        if (res.data && res.data.length > 0) {
          setSubjects(res.data);
        } else {
          // fallback
          setSubjects([
            { id: 1, name: 'Mathematics' },
            { id: 2, name: 'Science' },
            { id: 3, name: 'English' },
            { id: 4, name: 'Social Science' },
            { id: 5, name: 'Hindi' },
          ]);
        }
      } catch {
        setSubjects([
          { id: 1, name: 'Mathematics' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'English' },
          { id: 4, name: 'Social Science' },
          { id: 5, name: 'Hindi' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [classId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Choose a Subject</Text>
      <Text style={styles.subheading}>Select a subject to start revising chapters</Text>

      <View style={styles.grid}>
        {subjects.map((subj) => {
          const theme = getTheme(subj.name);
          return (
            <TouchableOpacity
              key={subj.id}
              style={[styles.card, { borderColor: theme.bg }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Chapters', { subjectId: subj.id, subjectName: subj.name })}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.bg }]}>
                <Text style={{ fontSize: 28 }}>{theme.icon}</Text>
              </View>
              <Text style={styles.subjectName}>{subj.name}</Text>
              <View style={[styles.arrow, { backgroundColor: theme.bg }]}>
                <Ionicons name="arrow-forward" size={16} color={theme.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  heading: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subheading: { fontSize: 14, color: '#9ca3af', marginBottom: 24, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    backgroundColor: '#ffffff',
    width: CARD_W,
    padding: 20,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
