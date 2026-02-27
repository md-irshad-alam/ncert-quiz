import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { SubjectsScreen } from '../screens/Subjects/SubjectsScreen';
import { ChaptersScreen } from '../screens/Chapters/ChaptersScreen';
import { PracticeScreen } from '../screens/Practice/PracticeScreen';
import { FlashcardsScreen } from '../screens/Practice/FlashcardsScreen';
import { DailyScreen } from '../screens/Daily/DailyScreen';
import { ProgressScreen } from '../screens/Progress/ProgressScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'DailyTab') iconName = focused ? 'flame' : 'flame-outline';
          else if (route.name === 'ProgressTab') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: focused ? 0 : 2,
            }}>
              {focused && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: '#22c55e',
                }} />
              )}
              <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="DailyTab" component={DailyScreen} options={{ title: 'Daily' }} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} options={{ title: 'Progress' }} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#22c55e',
        headerStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 18, color: '#111827' },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Subjects" component={SubjectsScreen} options={{ title: 'Subjects' }} />
      <Stack.Screen name="Chapters" component={ChaptersScreen} options={{ title: 'Chapters' }} />
      <Stack.Screen name="Practice" component={PracticeScreen} options={{ title: 'Practice MCQs' }} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{ title: 'Flashcards' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
