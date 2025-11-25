// app/(tabs)/(reports)/index.tsx
import React, { useState, useMemo } from 'react';
import { View, FlatList, Platform } from 'react-native';
import { Appbar, Searchbar, Snackbar, Button, useTheme, Text, ActivityIndicator, Chip, Dialog, Portal } from 'react-native-paper';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { Report } from '@/types/index';
import { ReportStyles } from '@/styles/report/ReportStyles';
import { useRouter, useFocusEffect } from 'expo-router';
import { NotificationService } from '@/services/notifications';
import { ReportCard } from '@/components/report/ReportCard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTasks } from '@/hooks/useTasks';

export default function ReportsScreen() {
  const { user, logout } = useAuth();
  const { 
    reports, 
    reportsDate, 
    isLoading, 
    loadReports, 
    loadReportsByDateRange, 
    deleteReport 
  } = useReports();
  const { 
    refreshTasks
  } = useTasks();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAllReports, setShowAllReports] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const theme = useTheme();
  const styles = ReportStyles(theme);

  // Обновляем данные при фокусе на экране
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 ReportsScreen: Обновление данных при фокусе');
      if (showAllReports) {
        loadReports();
      } else if (hasSearched && startDate && endDate) {
        // Если был выполнен поиск по дате, перезагружаем результаты
        handleSearchByDateRange();
      }
    }, [showAllReports, hasSearched, startDate, endDate])
  );

  // ФИКС: Корректное форматирование даты для отображения
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Выбрать дату';
    return date.toLocaleDateString('ru-RU');
  };

  // ФИКС: Корректное форматирование даты для API без смещения часового пояса
  const formatDateForApi = (date: Date | null): string => {
    if (!date) return '';
    
    // Создаем дату в локальном часовом поясе без времени
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    // Используем toISOString() и берем только дату
    return localDate.toISOString().split('T')[0];
  };

  // ФИКС: Улучшенная проверка дат с учетом только даты (без времени)
  const isReportInDateRange = (report: Report, start: Date, end: Date): boolean => {
    const reportDate = new Date(report.created_at);
    
    // Создаем даты без времени для корректного сравнения
    const reportDateOnly = new Date(
      reportDate.getFullYear(),
      reportDate.getMonth(),
      reportDate.getDate()
    );
    const startDateOnly = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const endDateOnly = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );
    
    return reportDateOnly >= startDateOnly && reportDateOnly <= endDateOnly;
  };

  // ФИКС: Корректная установка времени для DateTimePicker
  const getDateForPicker = (date: Date | null): Date => {
    return date || new Date();
  };

  // ФИКС: Обработка выбора даты с сохранением локального времени
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      // Сохраняем выбранную дату как есть (уже в локальном времени)
      setStartDate(selectedDate);
      if (!endDate || selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      setHasSearched(false);
    }
  };

  // ФИКС: Обработка выбора конечной даты
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      if (startDate && selectedDate < startDate) {
        setSnackbarMessage('Конечная дата не может быть меньше начальной');
        return;
      }
      setEndDate(selectedDate);
      setHasSearched(false);
    }
  };

  const allReportsSorted = useMemo(() => {
    const filtered = reports.filter(report =>
      report.task_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [reports, searchQuery]);

  const dateRangeReports = useMemo(() => {
    if (!reportsDate || reportsDate.length === 0) return [];
    
    // Фильтруем отчеты по выбранному диапазону дат
    let filteredByDate = reportsDate;
    
    if (startDate && endDate) {
      filteredByDate = reportsDate.filter(report => 
        isReportInDateRange(report, startDate, endDate)
      );
    }
    
    // Затем применяем поисковый запрос
    const filteredBySearch = filteredByDate.filter(report =>
      report.task_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredBySearch;
  }, [reportsDate, searchQuery, startDate, endDate]);

  const displayedReports = showAllReports ? allReportsSorted : dateRangeReports;

  const handleSearchByDateRange = async () => {
    if (!startDate || !endDate) {
      setSnackbarMessage('Выберите начальную и конечную дату');
      return;
    }

    if (startDate > endDate) {
      setSnackbarMessage('Начальная дата не может быть больше конечной');
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      
      // ФИКС: Используем корректно отформатированные даты
      const formattedStartDate = formatDateForApi(startDate);
      const formattedEndDate = formatDateForApi(endDate);
      
      console.log('🔍 Поиск отчетов по датам:', {
        startDate: startDate.toLocaleDateString('ru-RU'),
        endDate: endDate.toLocaleDateString('ru-RU'),
        formattedStartDate,
        formattedEndDate
      });
      
      await loadReportsByDateRange(formattedStartDate, formattedEndDate);
      
      setSnackbarMessage(`Найдено отчетов: ${reportsDate?.length || 0}`);
    } catch (error: any) {
      setSnackbarMessage('Ошибка при поиске отчетов: ' + error.message);
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setHasSearched(false);
    setSnackbarMessage('Диапазон дат очищен');
  };

  const showDeleteDialog = (report: Report) => {
    setReportToDelete(report);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setReportToDelete(null);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      setDeletingReportId(reportToDelete.id);
      await deleteReport(reportToDelete.id);
      setSnackbarMessage('Отчет удален');
      hideDeleteDialog();
      
      // Обновляем задачи после удаления отчета
      await refreshTasks();
      
    } catch (error: any) {
      setSnackbarMessage('Ошибка при удалении отчета: ' + error.message);
    } finally {
      setDeletingReportId(null);
    }
  };



  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      console.log('🧹 Очистка всех уведомлений перед выходом...');
      await NotificationService.cancelAllReminders();

      await logout();
      router.replace('/(auth)');

    } catch (error: any) {
      console.log('Logout error:', error);
      setSnackbarMessage('Ошибка при выходе: ' + error.message);
      setIsLoggingOut(false);
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onDelete={showDeleteDialog}
      deletingId={deletingReportId}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.center}>
      <Text style={styles.emptyText}>
        {showAllReports 
          ? 'Нет отчетов' 
          : !hasSearched
            ? 'Нажмите "Найти" для поиска отчетов'
            : startDate && endDate
              ? `Отчеты за период ${formatDate(startDate)} - ${formatDate(endDate)} не найдены`
              : 'Отчеты не найдены'
        }
      </Text>
      <Text style={styles.emptySubtext}>
        {showAllReports
          ? 'Отчеты появятся здесь после выполнения задач'
          : !hasSearched
            ? 'Выберите диапазон дат и нажмите кнопку "Найти"'
            : 'Попробуйте изменить диапазон дат'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content
          title={
            showAllReports
              ? `Все отчеты (${allReportsSorted.length})`
              : `По диапазону (${dateRangeReports.length})`
          }
        />
        <Appbar.Action
          icon="logout"
          onPress={handleLogout}
          disabled={isLoggingOut}
        />
      </Appbar.Header>

      <Searchbar
        placeholder="Поиск отчета по задаче, заказчику или описанию..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      <View style={styles.toggleContainer}>
        <Button
          mode={showAllReports ? "contained" : "outlined"}
          onPress={() => setShowAllReports(true)}
          style={styles.toggleButton}
        >
          Все отчеты ({allReportsSorted.length})
        </Button>
        <Button
          mode={!showAllReports ? "contained" : "outlined"}
          onPress={() => setShowAllReports(false)}
          style={styles.toggleButton}
        >
          По диапазону ({dateRangeReports.length})
        </Button>
      </View>

      {!showAllReports && (
        <View style={styles.dateFilterContainer}>
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeField}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Начальная дата *
                </Text>
                <Chip
                  mode="outlined"
                  onPress={() => setShowStartDatePicker(true)}
                  style={[styles.chip, !startDate && styles.requiredChip]}
                >
                  {formatDate(startDate)}
                </Chip>
              </View>

              <View style={styles.dateTimeField}>
                <Text variant="bodyMedium" style={styles.dateLabel}>
                  Конечная дата *
                </Text>
                <Chip
                  mode="outlined"
                  onPress={() => setShowEndDatePicker(true)}
                  style={[styles.chip, !endDate && styles.requiredChip]}
                >
                  {formatDate(endDate)}
                </Chip>
              </View>
            </View>

            {startDate && endDate && startDate > endDate && (
              <Text style={styles.dateError}>
                Дата окончания должна быть позже даты начала
              </Text>
            )}
          </View>

          <View style={styles.filterButtons}>
            <Button
              mode="outlined"
              onPress={handleClearDateRange}
              style={[styles.filterButton, styles.clearButton]}
              disabled={!startDate && !endDate}
              icon="close-circle"
            >
              Очистить
            </Button>
            <Button
              mode="contained"
              onPress={handleSearchByDateRange}
              style={styles.filterButton}
              disabled={!startDate || !endDate || isLoading || isSearching}
              loading={isSearching}
              icon="magnify"
            >
              Найти
            </Button>
          </View>

          {startDate && endDate && (
            <View style={styles.dateRangeInfo}>
              <Text style={styles.dateRangeText}>
                Выбран период: {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
              {hasSearched && (
                <Text style={styles.searchStatusText}>
                  Найдено отчетов: {dateRangeReports.length}
                </Text>
              )}
              {isSearching && (
                <Text style={styles.searchStatusText}>
                  Поиск отчетов...
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={getDateForPicker(startDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={endDate || new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={getDateForPicker(endDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
        />
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            {showAllReports ? 'Загрузка отчетов...' : 'Поиск отчетов...'}
          </Text>
        </View>
      ) : displayedReports.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayedReports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => {
            if (showAllReports) {
              loadReports();
            } else if (hasSearched && startDate && endDate) {
              handleSearchByDateRange();
            }
          }}
        />
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
          <Dialog.Icon icon="delete-alert" size={40} color={theme.colors.error} />
          <Dialog.Title style={{ textAlign: 'center' }}>
            Удаление отчета
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              Вы уверены, что хотите удалить отчет по задаче?
            </Text>
            {reportToDelete && (
              <Text 
                variant="bodyLarge" 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: theme.colors.primary 
                }}
              >
                "{reportToDelete.task_title}"
              </Text>
            )}
            <Text 
              variant="bodySmall" 
              style={{ 
                textAlign: 'center', 
                marginTop: 8,
                color: theme.colors.error 
              }}
            >
              Это действие нельзя отменить
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'space-around' }}>
            <Button 
              mode="outlined" 
              onPress={hideDeleteDialog}
              style={{ minWidth: 120 }}
            >
              Отмена
            </Button>
            <Button 
              mode="contained" 
              onPress={handleDeleteReport}
              style={{ minWidth: 120 }}
              buttonColor={theme.colors.error}
              textColor="#FFFFFF"
              loading={deletingReportId === reportToDelete?.id}
              disabled={deletingReportId === reportToDelete?.id}
            >
              Удалить
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage('')}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarMessage(''),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}