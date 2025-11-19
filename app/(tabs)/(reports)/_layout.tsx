// app/(tabs)/_layout.tsx
import { Stack, Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { NotificationService } from '@/services/notifications';
import { useTasks } from '@/hooks/useTasks';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const theme = useTheme();
  

  return (
    <>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      
      <Stack screenOptions={{
        // Используем цвета из темы телефона
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.onSurface, // ФИКС: Добавлен цвет для стрелки
        // Фон контента
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="create" 
          options={{ 
            title: 'Создание отчета',
            presentation: 'modal',
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.onSurface, // ФИКС: Добавлен цвет для стрелки
          }} 
        />
      </Stack>
    </>
  );
}