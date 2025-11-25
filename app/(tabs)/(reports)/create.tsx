import React, { useState } from 'react';
import { View, ScrollView, Image, Alert } from 'react-native';
import {
  Appbar,
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useReports } from '@/hooks/useReports';
import { Task } from '@/types';
import { ReportFormStyles } from '@/styles/report/ReportFormStyles';

interface PhotoAsset {
  uri: string;
  id: string;
  fileName?: string;
  type?: string;
}

export default function CreateReportScreen() {
  const theme = useTheme();
  const styles = ReportFormStyles(theme);
  const { task: taskParam } = useLocalSearchParams();
  const taskData = taskParam ? JSON.parse(taskParam as string) as Task : null;
  
  const { createReport, uploadPhotos } = useReports();
  
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const requestGalleryPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting gallery permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const pickFromGallery = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Доступ к галерее',
          'Для выбора фото необходимо предоставить доступ к галерее',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        await handleSelectedAssets(result.assets);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать фото из галереи');
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Доступ к камере',
          'Для съемки фото необходимо предоставить доступ к камере',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        await handleSelectedAssets(result.assets);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const handleSelectedAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    const newPhotos: PhotoAsset[] = assets.map(asset => ({
      uri: asset.uri,
      id: asset.assetId || `photo-${Date.now()}-${Math.random()}`,
      fileName: asset.fileName || `photo-${Date.now()}.jpg`,
      type: asset.type || 'image',
    }));

    const uniqueNewPhotos = newPhotos.filter(newPhoto => 
      !photos.some(existingPhoto => existingPhoto.id === newPhoto.id)
    );

    if (uniqueNewPhotos.length > 0) {
      setPhotos(prev => [...prev, ...uniqueNewPhotos]);
      
      if (uniqueNewPhotos.length === 1) {
        setSnackbarMessage('Фото добавлено в отчет');
      } else {
        setSnackbarMessage(`${uniqueNewPhotos.length} фото добавлены в отчет`);
      }
    } else {
      setSnackbarMessage('Эти фото уже добавлены в отчет');
    }
  };

  const createFilesForUpload = (assets: PhotoAsset[]): any[] => {
    return assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName || `photo-${Date.now()}-${index}.jpg`,
      type: 'image/jpeg',
    }));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Внимание', 'Пожалуйста, добавьте описание работ');
      return;
    }

    if (!taskData) {
      Alert.alert('Ошибка', 'Задача не найдена');
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedPhotoUrls: string[] = [];
      
      if (photos.length > 0) {
        setSnackbarMessage(`Загружаем ${photos.length} фото на сервер...`);
        
        const filesForUpload = createFilesForUpload(photos);
        uploadedPhotoUrls = await uploadPhotos(filesForUpload);
        
        console.log(`Успешно загружено ${uploadedPhotoUrls.length} фото на сервер`);
      }

      await createReport({
        task_id: taskData.id,
        description: description.trim(),
        photo_urls: uploadedPhotoUrls,
      });
      
      setSnackbarMessage(`Отчет успешно создан${photos.length > 0 ? ` с ${photos.length} фото` : ''}`);
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error submitting report:', error);
      setSnackbarMessage(error.message || 'Не удалось создать отчет');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!taskData) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="Ошибка" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>Задача не найдена</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.taskInfo}>
          <Text variant="titleMedium" style={styles.taskTitle}>
            Задача: {taskData.title}
          </Text>
          <Text variant="bodyMedium" style={styles.taskCustomer}>
            Заказчик: {taskData.customer}
          </Text>
          {taskData.address && (
            <Text variant="bodySmall" style={styles.taskAddress}>
              Адрес: {taskData.address}
            </Text>
          )}
        </View>

        <TextInput
          label="Описание выполненных работ *"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={4}
          maxLength={1000}
          placeholder="Опишите выполненные работы, использованные материалы, замечания и т.д."
        />

        <View style={styles.photosSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Фотографии ({photos.length})
          </Text>

          <View style={styles.photoButtons}>
            <Button
              mode="outlined"
              onPress={pickFromGallery}
              icon="image-multiple"
              style={styles.photoButton}
              disabled={isSubmitting}
            >
              Галерея
            </Button>
            <Button
              mode="outlined"
              onPress={takePhoto}
              icon="camera"
              style={styles.photoButton}
              disabled={isSubmitting}
            >
              Камера
            </Button>
          </View>

          {photos.length > 0 && (
            <View style={styles.selectedPhotosContainer}>
              <Text style={styles.sectionTitle}>Выбранные фото:</Text>
              <View style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image 
                      source={{ uri: photo.uri }} 
                      style={styles.photo} 
                    />
                    <IconButton
                      icon="close"
                      size={12}
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                      iconColor="white"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.button}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting || !description.trim()}
          >
            {photos.length > 0 ? `Создать отчет (${photos.length} фото)` : 'Создать отчет'}
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage('')}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}