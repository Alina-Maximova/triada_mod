// components/report/ReportDetailSheet.tsx
import React, { useState, useCallback } from 'react';
import { View, Image, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Report } from '@/types/index';
import { ReportListStyles } from '@/styles/report/ReportListStyles';
import { reportService } from '@/services/report';

const { width: screenWidth } = Dimensions.get('window');

interface ReportDetailSheetProps {
  report: Report | null;
  sheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
  onChange?: (index: number) => void;
  isLoading?: boolean; // Добавляем пропс для состояния загрузки
}

export const ReportDetailSheet: React.FC<ReportDetailSheetProps> = ({
  report,
  sheetRef,
  onClose,
  onChange,
  isLoading = false, // Значение по умолчанию
}) => {
  const theme = useTheme();
  const styles = ReportListStyles(theme);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const snapPoints = React.useMemo(() => ['70%', '90%'], []);

  // ФИКС: Правильный обработчик изменения шторки
  const handleSheetChange = useCallback((index: number) => {
    console.log('Шторка отчета изменила состояние:', index);
    if (onChange) {
      onChange(index);
    }
  }, [onChange]);

  // ФИКС: Функция для закрытия шторки
  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [sheetRef, onClose]);

  // Функция для открытия фото в полноэкранном режиме
  const openPhoto = (uri: string) => {
    setSelectedPhoto(uri);
    setPhotoModalVisible(true);
  };

  // Функция для закрытия полноэкранного просмотра
  const closePhotoModal = () => {
    setPhotoModalVisible(false);
    setSelectedPhoto(null);
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для рендеринга фотографий в виде сетки
  const renderPhotosGrid = () => {
    if (!report?.photo_urls || report.photo_urls.length === 0) {
      return null;
    }

    return (
      <View style={styles.photosSection}>
        <Text variant="titleLarge" style={styles.photosTitle}>
          Фотографии ({report.photo_urls.length})
        </Text>
        <View style={styles.photosGrid}>
          {report.photo_urls.map((url, index) => (
            <TouchableOpacity
              key={`photo-${index}`}
              style={styles.photoGridItem}
              onPress={() => openPhoto(url)}
            >
              <Image
                source={{ uri: reportService.getPhotoUrl(url) }}
                style={styles.photoGrid}
                resizeMode="cover"
              />
              <View style={styles.photoGridNumber}>
                <Text style={styles.photoGridNumberText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Если идет загрузка, показываем индикатор
  if (isLoading) {
    return (
      <BottomSheet
        ref={sheetRef}
        index={0} // Открыта по умолчанию
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
        onChange={handleSheetChange} // ФИКС: Используем useCallback
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        animateOnMount={true}
      >
        <View style={styles.sheetHeader}>
          <Text variant="headlineSmall" style={styles.sheetTitle}>
            Загрузка отчета...
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleClose} // ФИКС: Используем handleClose
          />
        </View>
        <View style={[styles.sheetContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Загружаем информацию об отчете...
          </Text>
        </View>
      </BottomSheet>
    );
  }

  // Если отчет не загружен (null) и не идет загрузка
  if (!report) {
    return (
      <BottomSheet
        ref={sheetRef}
        index={0} // Открыта по умолчанию
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
        onChange={handleSheetChange} // ФИКС: Используем useCallback
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        animateOnMount={true}
      >
        <View style={styles.sheetHeader}>
          <Text variant="headlineSmall" style={styles.sheetTitle}>
            Отчет не найден
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleClose} // ФИКС: Используем handleClose
          />
        </View>
        <View style={[styles.sheetContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <MaterialIcons name="error-outline" size={64} color={theme.colors.error} />
          <Text variant="bodyLarge" style={{ marginTop: 16, textAlign: 'center' }}>
            Отчет для этой задачи не найден
          </Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={0} // Открыта по умолчанию
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
        onChange={handleSheetChange} // ФИКС: Используем useCallback
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        animateOnMount={true}
      >
        <View style={styles.sheetHeader}>
          <Text variant="headlineSmall" style={styles.sheetTitle}>
            Отчет по задаче
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleClose} // ФИКС: Используем handleClose
          />
        </View>

        <BottomSheetScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Основная информация о задаче */}
          <View style={styles.sheetSection}>
            <Text variant="titleLarge" style={styles.sheetSectionTitle}>
              Информация о задаче
            </Text>
            
            <View style={styles.sheetRow}>
              <MaterialIcons name="assignment" size={22} color={theme.colors.primary} />
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={[styles.sheetText, { fontWeight: 'bold' }]}>
                  {report.task_title || 'Название задачи не указано'}
                </Text>
              </View>
            </View>

            {report.customer && (
              <View style={styles.sheetRow}>
                <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                <View style={styles.textContainer}>
                  <Text variant="labelLarge" style={styles.infoLabel}>
                    Заказчик
                  </Text>
                  <Text variant="bodyLarge" style={styles.sheetText}>
                    {report.customer}
                  </Text>
                </View>
              </View>
            )}

            {report.address && (
              <View style={styles.sheetRow}>
                <MaterialIcons name="location-on" size={20} color="#007AFF" />
                <View style={styles.textContainer}>
                  <Text variant="labelLarge" style={styles.infoLabel}>
                    Адрес
                  </Text>
                  <Text variant="bodyLarge" style={styles.sheetText}>
                    {report.address}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Divider style={styles.sheetDivider} />

          {/* Описание выполненной работы */}
          {report.description && (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleLarge" style={styles.sheetSectionTitle}>
                  Описание выполненной работы
                </Text>
                <View>
                  <Text variant="bodyLarge" style={styles.sheetText}>
                    {report.description}
                  </Text>
                </View>
              </View>
              <Divider style={styles.sheetDivider} />
            </>
          )}

          {/* Фотографии в виде сетки */}
          {renderPhotosGrid()}

          {/* Информация об отчете */}
          <View style={styles.sheetSection}>
            <Text variant="titleLarge" style={styles.sheetSectionTitle}>
             Информация об отчете
            </Text>

            {report.report_date && (
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={18} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelMedium" style={styles.infoLabel}>
                  Дата отчета:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {formatDate(report.report_date)}
                </Text>
              </View>
            )}

            {report.created_at && (
              <View style={styles.infoRow}>
                <MaterialIcons name="create" size={18} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelMedium" style={styles.infoLabel}>
                  Создан:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {formatDate(report.created_at)}
                </Text>
              </View>
            )}

            {report.updated_at && (
              <View style={styles.infoRow}>
                <MaterialIcons name="update" size={18} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelMedium" style={styles.infoLabel}>
                  Обновлен:
                </Text>
                <Text variant="bodyMedium" style={styles.infoValue}>
                  {formatDate(report.updated_at)}
                </Text>
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Модальное окно для полноэкранного просмотра фото */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <View style={styles.photoModal}>
          {selectedPhoto && (
            <Image
              source={{ uri: reportService.getPhotoUrl(selectedPhoto) }}
              style={styles.photoFullscreen}
              resizeMode="contain"
            />
          )}
          <IconButton
            icon="close"
            size={24}
            iconColor="white"
            style={styles.photoCloseButton}
            onPress={closePhotoModal}
          />
        </View>
      </Modal>
    </>
  );
};