// components/task/TaskDetailSheet.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import { Text, Button, IconButton, useTheme, ActivityIndicator, Menu, Dialog, Portal, Chip, Badge } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { WebView } from 'react-native-webview';
import { Task, Report } from '@/types/index';
import { TaskListStyles } from '@/styles/task/TaskListStyles';
import { useReports } from '@/hooks/useReports';
import { CommentModal } from '@/components/common/CommentModal';
import { useComments } from '@/hooks/useComments';
import { AppTheme } from '@/constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface TaskDetailSheetProps {
  task: Task | null;
  sheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onCreateReport: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: string, pauseReason?: string) => void;
  onViewReport?: (report: Report) => void;
  onAddComment: (taskId: number, comment: string) => Promise<void>;
  onViewComments?: (task: Task) => void;
}

// HTML для Яндекс Карт
const getMapHTML = (coordinates: { lat: number; lon: number } | null, taskTitle?: string, taskAddress?: string) => {
  if (!coordinates) return '';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Местоположение задачи</title>
    <script src="https://api-maps.yandex.ru/2.1/?apikey=7f66d4c8-981a-4b98-b4b0-8bef0dae0b1c&lang=ru_RU"></script>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        ymaps.ready(init);
        
        function init() {
            const map = new ymaps.Map('map', {
                center: [${coordinates.lat}, ${coordinates.lon}],
                zoom: 15,
                controls: ['zoomControl', 'fullscreenControl']
            });
            
            const placemark = new ymaps.Placemark([${coordinates.lat}, ${coordinates.lon}], {
                balloonContentHeader: '${taskTitle || 'Местоположение'}',
                balloonContentBody: '${taskAddress || 'Адрес не указан'}',
                balloonContentFooter: 'Координаты: ${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}'
            }, {
                preset: 'islands#redIcon',
                draggable: false
            });
            
            map.geoObjects.add(placemark);
            
            // Открываем балун при загрузке
            placemark.balloon.open();
        }
    </script>
</body>
</html>
`;
};

// Функция для получения данных статуса с использованием цветов из темы
const getStatusData = (status: string, theme: AppTheme) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Выполнено',
        color: theme.colors.status.completed,
        icon: 'check-circle',
        backgroundColor: theme.colors.status.completedContainer
      };
    case 'in_progress':
      return {
        label: 'В работе',
        color: theme.colors.status.inProgress,
        icon: 'progress-clock',
        backgroundColor: theme.colors.status.inProgressContainer
      };
    case 'paused':
      return {
        label: 'На паузе',
        color: theme.colors.status.paused,
        icon: 'pause-circle',
        backgroundColor: theme.colors.status.pausedContainer
      };
    case 'report_added':
      return {
        label: 'Добавлен отчет',
        color: theme.colors.status.reportAdded,
        icon: 'file-document',
        backgroundColor: theme.colors.status.reportAddedContainer
      };
    case 'accepted_by_customer':
      return {
        label: 'Принято заказчиком',
        color: theme.colors.status.accepted,
        icon: 'account-check',
        backgroundColor: theme.colors.status.acceptedContainer
      };
    case 'new':
    default:
      return {
        label: 'Новая',
        color: theme.colors.status.new,
        icon: 'clock-outline',
        backgroundColor: theme.colors.status.newContainer
      };
  }
};

// Функция для получения текста подтверждения
const getConfirmationMessage = (currentStatus: string, newStatus: string): string => {
  const statusLabels: Record<string, string> = {
    new: 'Новая',
    in_progress: 'В работе',
    completed: 'Выполнена',
    paused: 'На паузе',
    report_added: 'Добавлен отчет',
    accepted_by_customer: 'Принято заказчиком'
  };

  const currentLabel = statusLabels[currentStatus] || currentStatus;
  const newLabel = statusLabels[newStatus] || newStatus;

  return `Вы уверены, что хотите изменить статус задачи с "${currentLabel}" на "${newLabel}"?`;
};

// Функция для получения описания изменения статуса
const getStatusChangeDescription = (currentStatus: string, newStatus: string): string => {
  if (newStatus === 'paused') {
    return 'При изменении статуса на "Пауза" необходимо указать причину приостановки задачи.';
  }

  if (currentStatus === 'new' && newStatus === 'in_progress') {
    return 'Задача будет перемещена в работу. Вы сможете продолжить редактирование и в конечном итоге отметить её как выполненную.';
  }

  if (currentStatus === 'in_progress' && newStatus === 'completed') {
    return 'Задача будет отмечена как выполненная. После этого вы сможете создать отчёт по задаче.';
  }

  if (currentStatus === 'report_added' && newStatus === 'accepted_by_customer') {
    return 'Заказчик подтвердил выполнение работы. Задача будет считаться полностью завершенной.';
  }

  return 'Это действие изменит статус задачи.';
};

// Функция для проверки возможности изменения статуса
const canChangeStatus = (currentStatus: string, newStatus: string): boolean => {
  if (currentStatus === 'completed' || currentStatus === 'accepted_by_customer') {
    return false;
  }

  if (currentStatus === 'new') {
    return newStatus === 'in_progress' || newStatus === 'paused';
  }

  if (currentStatus === 'in_progress') {
    return newStatus === 'completed' || newStatus === 'paused';
  }

  if (currentStatus === 'paused') {
    return newStatus === 'in_progress' || newStatus === 'completed';
  }

  if (currentStatus === 'report_added') {
    return newStatus === 'accepted_by_customer';
  }

  return false;
};

// Функция для получения доступных статусов для текущего состояния
const getAvailableStatuses = (currentStatus: string): string[] => {
  if (currentStatus === 'completed' || currentStatus === 'accepted_by_customer') {
    return [];
  }

  if (currentStatus === 'new') {
    return ['in_progress', 'paused'];
  }

  if (currentStatus === 'in_progress') {
    return ['completed', 'paused'];
  }

  if (currentStatus === 'paused') {
    return ['in_progress', 'completed'];
  }

  if (currentStatus === 'report_added') {
    return ['accepted_by_customer'];
  }

  return [];
};

// Функция для форматирования комментария паузы
const formatPauseComment = (comment: string): string => {
  const prefix = 'Причина постановки на паузы:';

  // Если комментарий уже начинается с префикса, возвращаем как есть
  if (comment.trim().toLowerCase().startsWith(prefix.toLowerCase())) {
    return comment.trim();
  }

  // Иначе добавляем префикс
  return `${prefix} ${comment.trim()}`;
};

export const TaskDetailSheet: React.FC<TaskDetailSheetProps> = ({
  task,
  sheetRef,
  onClose,
  onEdit,
  onStatusChange,
  onCreateReport,
  onViewReport,
  onAddComment,
  onViewComments,
}) => {
  const theme = useTheme() as AppTheme;
  const styles = TaskListStyles(theme);
  const webViewRef = useRef<WebView>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  // Состояния для диалогового окна
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ newStatus: string } | null>(null);

  // Состояния для отчета
  const [taskReport, setTaskReport] = useState<Report | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [lastTaskId, setLastTaskId] = useState<number | null>(null);

  // Состояния для комментариев
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentAction, setCommentAction] = useState<'pause' | 'comment'>('comment');

  // Добавляем хук для комментариев
  const { comments, isLoading: isLoadingComments, refreshComments } = useComments();

  const { getReportByTaskId } = useReports();

  const snapPoints = React.useMemo(() => ['60%', '90%'], []);

  // ФИКС: Используем useCallback для обработчиков анимаций
  const handleSheetChange = useCallback((index: number) => {
    console.log('Шторка деталей задачи изменила состояние:', index);
  }, []);

  // Загрузка отчета при открытии задачи
  useEffect(() => {
    const loadReport = async () => {
      if (task && (task.status === 'completed' || task.status === 'report_added' || task.status === 'accepted_by_customer')) {
        if (task.id === lastTaskId && taskReport !== null) {
          return;
        }

        setIsLoadingReport(true);
        setReportError(null);
        try {
          const report = await getReportByTaskId(task.id);
          console.log('Отчет загружен:', report);
          setTaskReport(report);
          setLastTaskId(task.id);
        } catch (error: any) {
          console.log('Отчет не найден для задачи:', task.id, error.message);
          setTaskReport(null);
          setLastTaskId(task.id);
          if (!error.message?.includes('не найден') && !error.message?.includes('404')) {
            setReportError('Ошибка загрузки отчета');
          }
        } finally {
          setIsLoadingReport(false);
        }
      } else {
        setTaskReport(null);
        setReportError(null);
        setLastTaskId(null);
      }
    };

    loadReport();
  }, [task]);

  // Загрузка комментариев при открытии задачи
  useEffect(() => {
    const loadComments = async () => {
      if (task) {
        try {
          await refreshComments(task.id);
        } catch (error) {
          console.error('Error loading comments:', error);
        }
      }
    };

    loadComments();
  }, [task]);

  const handleEditPress = () => {
    if (task) {
      sheetRef.current?.close();
      setTimeout(() => onEdit(task), 300);
    }
  };

  // Функция для просмотра комментариев - закрываем шторку и вызываем колбэк
  const handleViewCommentsPress = () => {
    if (task && onViewComments) {
      setTimeout(() => onViewComments(task), 300);
    }
  };

  // Функция для добавления комментария
  const handleAddCommentPress = () => {
    setCommentAction('comment');
    setCommentModalVisible(true);
  };

  const handleCommentSave = async (comment: string) => {
    if (!task) return;

    try {
      setIsAddingComment(true);
      await onAddComment(task.id, comment);
      setCommentModalVisible(false);
      // Обновляем комментарии после добавления
      await refreshComments(task.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (task && onStatusChange) {
      if (!canChangeStatus(task.status, newStatus)) {
        setStatusMenuVisible(false);
        return;
      }

      // Если меняем статус на "пауза", открываем модальное окно для комментария
      if (newStatus === 'paused') {
        setCommentAction('pause');
        setPendingStatusChange({ newStatus });
        setCommentModalVisible(true);
      } else {
        // Для других статусов показываем обычное подтверждение
        setPendingStatusChange({ newStatus });
        setDialogVisible(true);
      }
      setStatusMenuVisible(false);
    }
  };

  const confirmStatusChange = () => {
    if (task && pendingStatusChange) {
      onStatusChange(task.id, pendingStatusChange.newStatus);
      setDialogVisible(false);
      setPendingStatusChange(null);
    }
  };

  const cancelStatusChange = () => {
    setDialogVisible(false);
    setPendingStatusChange(null);
  };

  // Функция для обработки сохранения комментария при паузе
  const handlePauseWithComment = async (comment: string) => {
    if (task && pendingStatusChange) {
      try {
        setIsAddingComment(true);

        // Форматируем комментарий для паузы
        const formattedComment = formatPauseComment(comment);

        // Сначала добавляем комментарий
        await onAddComment(task.id, formattedComment);
        // Затем меняем статус
        await onStatusChange(task.id, pendingStatusChange.newStatus, formattedComment);
        setCommentModalVisible(false);
        setPendingStatusChange(null);
        // Обновляем комментарии после добавления
        await refreshComments(task.id);
      } catch (error) {
        console.error('Error pausing task with comment:', error);
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  // Функция для получения координат задачи
  const getTaskCoordinates = () => {
    if (!task?.latitude || !task?.longitude) return null;

    try {
      const lat = parseFloat(task.latitude);
      const lng = parseFloat(task.longitude);

      if (isNaN(lat) || isNaN(lng)) return null;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

      return {
        lat: lat,
        lon: lng,
      };
    } catch (error) {
      console.error('Ошибка парсинга координат:', error);
      return null;
    }
  };

  // Функция для создания отчета - не закрываем шторку задачи
  const handleCreateReportPress = () => {
    if (task) {
      // Не закрываем шторку задачи, просто вызываем создание отчета
      onCreateReport(task);
    }
  };

  // Функция для просмотра отчета - не закрываем шторку задачи
  const handleViewReportPress = () => {
    if (taskReport && onViewReport) {
      // Не закрываем шторку задачи, просто вызываем просмотр отчета
      onViewReport(taskReport);
    }
  };

  const coordinates = getTaskCoordinates();

  if (!task) return null;

  const currentStatusData = getStatusData(task.status, theme);
  const availableStatuses = getAvailableStatuses(task.status);

  // Отображаем информацию об отчете
  const renderReportInfo = () => {
    if (task.status !== 'completed' && task.status !== 'report_added' && task.status !== 'accepted_by_customer') return null;

    if (isLoadingReport) {
      return (
        <View style={styles.sheetSection}>
          <ActivityIndicator size="small" />
          <Text variant="bodySmall" style={{ marginTop: 8 }}>
            Загрузка информации об отчете...
          </Text>
        </View>
      );
    }

    if (reportError) {
      return (
        <View style={styles.sheetSection}>
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {reportError}
          </Text>
        </View>
      );
    }

    if (taskReport) {
      return (
        <View style={styles.sheetSection}>
          <View style={styles.sheetRow}>
            <MaterialIcons name="assignment" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                Есть отчет
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Отчет создан {new Date(taskReport.created_at).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.sheetSection}>
          <View style={styles.sheetRow}>
            <MaterialIcons name="assignment" size={20} color={theme.colors.onSurfaceVariant} />
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                Отчет по задаче
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Для этой задачи еще не создан отчет
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
            Добавьте отчет с описанием выполненных работ и фотографиями
          </Text>
        </View>
      );
    }
  };

  // Отображаем информацию о комментариях
  const renderCommentsInfo = () => {
    return (
      <View style={styles.sheetSection}>
        <View style={styles.sheetRow}>
          <MaterialIcons name="comment" size={20} color={theme.colors.primary} />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.sheetSectionTitle}>
              Комментарии
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {comments.length === 0
                ? 'Нет комментариев'
                : `Количество комментариев: ${comments.length}`
              }
            </Text>
          </View>
        </View>
        {comments.length > 0 && (
          <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
            Последний комментарий: {new Date(comments[comments.length - 1].created_at).toLocaleDateString('ru-RU')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onClose}
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
        animateOnMount={true}
      >
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineSmall" style={styles.sheetTitle} numberOfLines={1}>
              {task.title}
            </Text>
            <Text variant="bodyMedium" style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: 2
            }} numberOfLines={1}>
              Детали задачи
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
          />
        </View>

        <BottomSheetScrollView style={styles.sheetContent}>
          {/* Статус с возможностью изменения */}
          <View style={styles.sheetSection}>
            <View style={styles.chipsContainer}>
              {task.status === 'completed' || task.status === 'accepted_by_customer' ? (
                <Chip
                  mode="outlined"
                  icon={currentStatusData.icon}
                  textStyle={[
                    styles.chipText,
                    { color: currentStatusData.color }
                  ]}
                  style={[
                    styles.statusChip,
                    {
                      borderColor: currentStatusData.color,
                      backgroundColor: currentStatusData.backgroundColor
                    }
                  ]}
                  contentStyle={styles.chipContent}
                >
                  {currentStatusData.label}
                </Chip>
              ) : (
                <Menu
                  visible={statusMenuVisible}
                  onDismiss={() => setStatusMenuVisible(false)}
                  anchor={
                    <Chip
                      mode="outlined"
                      icon={currentStatusData.icon}
                      textStyle={[
                        styles.chipText,
                        { color: currentStatusData.color }
                      ]}
                      style={[
                        styles.statusChip,
                        {
                          borderColor: currentStatusData.color,
                          backgroundColor: currentStatusData.backgroundColor
                        }
                      ]}
                      onPress={() => setStatusMenuVisible(true)}
                    >
                      {currentStatusData.label}
                    </Chip>
                  }
                >
                  {availableStatuses.includes('in_progress') && (
                    <Menu.Item
                      leadingIcon="progress-clock"
                      onPress={() => handleStatusChange('in_progress')}
                      title="В работу"
                    />
                  )}
                  {availableStatuses.includes('completed') && (
                    <Menu.Item
                      leadingIcon="check-circle"
                      onPress={() => handleStatusChange('completed')}
                      title="Выполнено"
                    />
                  )}
                  {availableStatuses.includes('paused') && (
                    <Menu.Item
                      leadingIcon="pause-circle"
                      onPress={() => handleStatusChange('paused')}
                      title="На паузу"
                    />
                  )}
                  {availableStatuses.includes('accepted_by_customer') && (
                    <Menu.Item
                      leadingIcon="account-check"
                      onPress={() => handleStatusChange('accepted_by_customer')}
                      title="Принято заказчиком"
                    />
                  )}

                  {availableStatuses.length === 0 && (
                    <Menu.Item
                      leadingIcon="information"
                      title="Нет доступных действий"
                      disabled={true}
                    />
                  )}
                </Menu>
              )}
            </View>

            {(task.status === 'completed' || task.status === 'accepted_by_customer') && (
              <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                {task.status === 'completed'
                  ? 'Задача выполнена. Статус нельзя изменить.'
                  : 'Задача принята заказчиком. Статус нельзя изменить.'
                }
              </Text>
            )}
          </View>

          <View style={styles.sheetDivider} />

          {/* Информация о комментариях */}
          {renderCommentsInfo()}
          <View style={styles.sheetDivider} />

          {/* Информация об отчете */}
          {(task.status === 'completed' || task.status === 'report_added' || task.status === 'accepted_by_customer') && (
            <>
              {renderReportInfo()}
              <View style={styles.sheetDivider} />
            </>
          )}

          {/* Заказчик */}
          {task.customer && (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                  Заказчик
                </Text>
                <View style={styles.sheetRow}>
                  <MaterialIcons name="person" size={20} color={theme.colors.primary} />
                  <Text variant="bodyLarge" style={styles.sheetText}>
                    {task.customer}
                  </Text>
                </View>
              </View>
              <View style={styles.sheetDivider} />
            </>
          )}

          {/* Телефон */}
          {task.phone && (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                  Контакты
                </Text>
                <View style={styles.sheetRow}>
                  <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
                  <Text variant="bodyLarge" style={styles.sheetText}>
                    {task.phone}
                  </Text>
                </View>
              </View>
              <View style={styles.sheetDivider} />
            </>
          )}

          {/* Описание */}
          {task.description && (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                  Описание
                </Text>
                <Text variant="bodyMedium" style={styles.descriptionText}>
                  {task.description}
                </Text>
              </View>
              <View style={styles.sheetDivider} />
            </>
          )}

          {/* Даты выполнения */}
          <View style={styles.sheetSection}>
            <Text variant="titleMedium" style={styles.sheetSectionTitle}>
              Сроки выполнения
            </Text>

            {task.start_date && (
              <View style={styles.sheetRow}>
                <MaterialIcons name="play-arrow" size={18} color={theme.colors.primary} />
                <View style={styles.dateInfo}>
                  <Text variant="labelMedium" style={styles.dateLabel}>
                    Дата начала
                  </Text>
                  <Text variant="bodyMedium" style={styles.sheetText}>
                    {new Date(task.start_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}

            {task.due_date && (
              <View style={styles.sheetRow}>
                <MaterialIcons name="flag" size={18} color={theme.colors.error} />
                <View style={styles.dateInfo}>
                  <Text variant="labelMedium" style={styles.dateLabel}>
                    Дата окончания
                  </Text>
                  <Text variant="bodyMedium" style={styles.sheetText}>
                    {new Date(task.due_date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.sheetDivider} />

          {/* Яндекс Карта с местоположением через WebView */}
          {coordinates ? (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                  Местоположение
                </Text>

                {/* Адрес */}
                {task.address && (
                  <View style={styles.sheetRow}>
                    <MaterialIcons name="location-on" size={20} color="#007AFF" />
                    <Text variant="bodyMedium" style={styles.sheetText}>
                      {task.address}
                    </Text>
                  </View>
                )}

                {/* Координаты */}
                <Text variant="bodySmall" style={styles.coordinatesText}>
                  Координаты: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                </Text>

                {/* Яндекс Карта через WebView */}
                <View style={styles.mapContainer}>
                  {isMapLoading && (
                    <View style={styles.mapLoadingOverlay}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text style={styles.mapLoadingText}>Загрузка карты...</Text>
                    </View>
                  )}

                  <WebView
                    ref={webViewRef}
                    source={{ html: getMapHTML(coordinates, task.title, task.address) }}
                    style={styles.map}
                    onLoadEnd={() => setIsMapLoading(false)}
                    onError={(error) => {
                      console.error('WebView error:', error);
                      setIsMapLoading(false);
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                  />
                </View>
              </View>
              <View style={styles.sheetDivider} />
            </>
          ) : task.address ? (
            <>
              <View style={styles.sheetSection}>
                <Text variant="titleMedium" style={styles.sheetSectionTitle}>
                  Адрес
                </Text>
                <View style={styles.sheetRow}>
                  <MaterialIcons name="location-on" size={20} color="#007AFF" />
                  <Text variant="bodyMedium" style={styles.sheetText}>
                    {task.address}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.coordinatesText}>
                  Координаты не указаны
                </Text>
              </View>
              <View style={styles.sheetDivider} />
            </>
          ) : null}

          {/* Информация о создании и обновления */}
          <View style={styles.sheetSection}>
            <Text variant="titleMedium" style={styles.sheetSectionTitle}>
              Информация
            </Text>

            {task.created_at && (
              <View style={styles.infoRow}>
                <Text variant="labelSmall" style={styles.infoLabel}>
                  Создана:
                </Text>
                <Text variant="bodySmall" style={styles.infoValue}>
                  {new Date(task.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}

            {task.updated_at && (
              <View style={styles.infoRow}>
                <Text variant="labelSmall" style={styles.infoLabel}>
                  Обновлена:
                </Text>
                <Text variant="bodySmall" style={styles.infoValue}>
                  {new Date(task.updated_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>

        </BottomSheetScrollView>

        <View style={styles.sheetActions}>
          {/* Кнопка просмотра комментариев с бейджем */}
          <View style={{ flex: 1, position: 'relative' }}>
            <Button
              mode="outlined"
              onPress={handleViewCommentsPress}
              style={styles.sheetButton}
              icon="comment-text-multiple"
              compact={true}
            >
              {/* Пустой текст - только иконка */}
            </Button>

            <View style={{
              position: 'absolute',
              top: -5,
              right: -5,
              zIndex: 1,
            }}>
              <Badge
                size={20}
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              >
                {comments.length}
              </Badge>
            </View>

          </View>

          {/* Кнопка добавления комментария */}
          <Button
            mode="outlined"
            onPress={handleAddCommentPress}
            style={styles.sheetButton}
            icon="comment-plus"
            compact={true}
          >
            {/* Пустой текст - только иконка */}
          </Button>

          {/* Кнопка создания отчета для выполненных задач без отчета */}
          {task.status === 'completed' && !taskReport && (
            <Button
              mode="contained"
              onPress={handleCreateReportPress}
              style={styles.sheetButton}
              icon="file-document"
              compact={true}
            >
              {/* Пустой текст - только иконка */}
            </Button>
          )}

          {/* Кнопка просмотра отчета для задач с отчетом */}
          {taskReport && (
            <Button
              mode="contained"
              onPress={handleViewReportPress}
              style={styles.sheetButton}
              icon="file-eye"
              compact={true}
            >
              {/* Пустой текст - только иконка */}
            </Button>
          )}

          {/* Кнопка редактирования - только для статусов: новый, в процессе, на паузе */}
          {(task.status === 'new' || task.status === 'in_progress' || task.status === 'paused') && (
            <Button
              mode="contained"
              onPress={handleEditPress}
              style={styles.sheetButton}
              icon="pencil"
              compact={true}
            >
              {/* Пустой текст - только иконка */}
            </Button>
          )}
        </View>
      </BottomSheet>

      {/* Диалоговое окно подтверждения изменения статуса */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={cancelStatusChange}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>
            Изменение статуса задачи
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              {task && pendingStatusChange &&
                getConfirmationMessage(task.status, pendingStatusChange.newStatus)
              }
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {task && pendingStatusChange &&
                getStatusChangeDescription(task.status, pendingStatusChange.newStatus)
              }
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelStatusChange}>Отмена</Button>
            <Button
              mode="contained"
              onPress={confirmStatusChange}
              style={{ marginLeft: 8 }}
            >
              Изменить статус
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Модальное окно для комментариев */}
      <CommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setPendingStatusChange(null);
        }}
        onSave={commentAction === 'pause' ? handlePauseWithComment : handleCommentSave}
        title={commentAction === 'pause' ? 'Причина паузы' : 'Добавить комментарий'}
        placeholder={commentAction === 'pause' ? 'Укажите причину приостановки задачи...' : 'Введите комментарий к задаче...'}
        required={commentAction === 'pause'}
        isLoading={isAddingComment}
      />
    </>
  );
};

