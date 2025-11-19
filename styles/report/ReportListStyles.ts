// styles/report/ReportStyles.ts
import { StyleSheet } from 'react-native';

export const ReportListStyles = (theme: any) => StyleSheet.create({
  // Основные стили контейнера
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Стили для шторки отчета
  sheetBackground: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  sheetTitle: {
    flex: 1,
    marginRight: 8,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  sheetContent: {
    flex: 1,
  },
  sheetSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetSectionTitle: {
    marginBottom: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: theme.colors.onSurface,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: theme.colors.outline,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    gap: 8,
  },
  sheetButton: {
    flex: 1,
  },

  // Стили для информации
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    color: theme.colors.outline,
    fontSize: 12,
  },
  infoValue: {
    color: theme.colors.onSurface,
    fontSize: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  // Стили для описания
  descriptionBox: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  descriptionText: {
    lineHeight: 22,
    color: theme.colors.onSurface,
    fontSize: 16,
  },

  // Стили для фотографий
  photosContainer: {
    marginTop: 8,
  },
  photoItemLarge: {
    marginRight: 16,
    alignItems: 'center',
  },
  photoLarge: {
    width: 280,
    height: 200,
    borderRadius: 16,
    marginBottom: 8,
  },
  photoNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewPhotoButton: {
    marginTop: 8,
  },

  // Стили для дат
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    color: theme.colors.outline,
    marginBottom: 2,
    fontSize: 12,
  },

  // Стили для статусов
  statusChip: {
    height: 32,
  },
  materialChip: {
    height: 32,
    backgroundColor: theme.colors.surfaceVariant,
  },

  // Стили для дополнительных секций
  additionalSection: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  costText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  timeText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Стили для пустого состояния
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
    photosSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  photosTitle: {
    marginBottom: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  photoGridItem: {
    width: '48%', // 2 колонки с небольшим отступом
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant,
  },
  photoGrid: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  photoGridNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoGridNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Стили для горизонтального скролла фотографий (альтернативный вариант)
  photosHorizontalContainer: {
    marginTop: 8,
  },
  photoHorizontalItem: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoHorizontal: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },

  // Стили для полноэкранного просмотра фотографий
  photoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFullscreen: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  photoCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Стили для кнопок действий с фото
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  photoActionButton: {
    flex: 1,
  },
});