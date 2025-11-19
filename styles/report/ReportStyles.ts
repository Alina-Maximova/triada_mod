// styles/report/ReportStyles.ts
import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const ReportStyles = (theme: MD3Theme) => StyleSheet.create({
  // Основные стили контейнера
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Стили для поиска
  search: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },

  // Стили для переключателя
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
  },

  // Стили для фильтра по датам
  dateFilterContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  dateTimeSection: {
    marginBottom: 16,
  },
  dateLabel: {
    marginBottom: 8,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateTimeField: {
    flex: 1,
  },
  chip: {
    width: '100%',
    justifyContent: 'center',
    height: 40,
  },
  requiredChip: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  dateError: {
    color: theme.colors.error,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 8,
  },

  // Стили для кнопок фильтрации
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  clearButton: {
    borderColor: theme.colors.error,
  },

  // Стили для информации о диапазоне дат
  dateRangeInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  dateRangeText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Стили для состояний загрузки и пустого состояния
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.outline,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },

  // Стили для списка
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },

  // Дополнительные стили (можно удалить если не используются)
  tabContainer: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTab: {
    backgroundColor: theme.colors.primaryContainer,
  },
  modal: {
    backgroundColor: theme.colors.background,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  scrollView: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  taskTitle: {
    marginBottom: 8,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  taskCustomer: {
    marginBottom: 16,
    color: theme.colors.onSurfaceVariant,
  },
  input: {
    marginBottom: 20,
  },
  photosSection: {
    marginBottom: 20,
  },
  addPhotoButton: {
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: theme.colors.onSurfaceVariant,
  },
  reportCard: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportTitle: {
    flex: 1,
    marginRight: 8,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  dateChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  customerText: {
    marginBottom: 4,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  addressText: {
    marginBottom: 12,
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  description: {
    marginBottom: 16,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  photosTitle: {
    marginBottom: 8,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  reportPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  list: {
    paddingBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: theme.colors.onErrorContainer,
    textAlign: 'center',
  },
  dateTimeChip: {
    width: '100%',
    justifyContent: 'center',
  },
  errorChip: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.background,
  },
    headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  deletingText: {
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  searchStatusText: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: 4,
    fontSize: 12,
  },
});