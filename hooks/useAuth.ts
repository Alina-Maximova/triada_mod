import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, LoginData } from '@/types';
import { authAPI } from '@/services/task';
import { STORAGE_KEYS } from '@/constants';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []); // Убрали зависимость от user

    const checkAuth = async () => {
        try {
            const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.log('Auth check:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginData): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await authAPI.login(data);
            console.log(response.user)

            if (response.user.role_name === "User") {
                throw new Error("Вы не работник")
            }
            await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
            setUser(response.user);
            return { success: true };
        } catch (error: any) {
            console.log('Login error:', error);
            return {
                success: false,
                message: error.message || 'Ошибка входа'
            };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await authAPI.logout();
            // Очищаем SecureStore
            await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
            // Сбрасываем состояние
            setUser(null);
            console.log('User after logout:', null);
        } catch (error) {
            console.log('Logout error:', error);
            // Даже при ошибке очищаем локальные данные
            await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
            setUser(null);
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };
};