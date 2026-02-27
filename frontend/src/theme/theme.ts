import { DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#111827',
    border: '#f1f5f9',
    notification: '#ef4444',
    primary: '#0d6efd',
    subText: '#6b7280',
    cardBackground: '#ffffff',
    iconBackground: '#f0fdf4',
  },
};

export const darkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    notification: '#ef4444',
    primary: '#3b82f6',
    subText: '#9ca3af',
    cardBackground: '#1f2937',
    iconBackground: '#064e3b',
  },
};

export const useAppTheme = (isDarkMode: boolean) => {
  return isDarkMode ? darkTheme : lightTheme;
};
