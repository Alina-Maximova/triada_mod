import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar, useTheme } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
// eslint-disable-next-line import/no-unresolved
import { LoginData } from '@/services/task';
import { useRouter } from 'expo-router';
import {AuthScreenStyles} from "@/styles/auth/AuthScreenStyles"

 function AuthScreen () {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
const theme = useTheme();
const styles = AuthScreenStyles(theme); 
  // Перенаправление при успешной авторизации
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to tasks...'); 
      // Используем replace чтобы нельзя было вернуться назад к auth
      router.replace('/(tabs)');     
    }
      // router.replace('/(tabs)');     

  }, [user, router]);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setSnackbarMessage('Заполните все обязательные поля');
      setSnackbarVisible(true);
      return;
    }

    try {
      const loginData: LoginData = {
        email: formData.email,
        password: formData.password
      };
      
      const result = await login(loginData);

      console.log('Auth result:', result);

      if (!result.success) {
        setSnackbarMessage(result.message || 'Произошла ошибка');
        setSnackbarVisible(true);
      } else {
        // Успешная авторизация - форма очистится автоматически
        setSnackbarMessage('Вход выполнен!');
        setSnackbarVisible(true);
        // Перенаправление произойдет автоматически через useEffect
      }
    } catch (error: any) {
      console.log('Auth error:', error);
      setSnackbarMessage(error.message || 'Произошла ошибка');
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Вход в систему
            </Text>

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Пароль"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Войти
            </Button>
          </Card.Content>
        </Card>

       
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};



export default AuthScreen;