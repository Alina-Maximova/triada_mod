// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, Text } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

// ФИКС: Игнорировать предупреждения Reanimated
LogBox.ignoreLogs([
  '[Reanimated]',
]);

// Компонент для отображения загрузки
function LoadingScreen() {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: 16,
      color: theme.colors.onSurface,
    },
  });

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Загрузка...</Text>
    </View>
  );
}

// Основной компонент приложения с темами
function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const { theme } = useTheme();

  // Для отладки
  useEffect(() => {
    console.log('User:', user);
  }, [user, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar 
        style={theme.dark ? 'light' : 'dark'}
        backgroundColor={theme.colors.background}
      />
      {!user ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      )}
    </PaperProvider>
  );
}

// Корневой компонент
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}