import { StyleSheet } from 'react-native';

export const ReportFormStyles = (theme: any) => StyleSheet.create({
   // Основные стили контейнера
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  }, 
  modal: {
    backgroundColor: theme.colors.background,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
    borderColor: theme.colors.primary,
    borderWidth: 2,

  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  taskInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  taskTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.onSurface,
  },
  taskCustomer: {
    marginBottom: 4,
    color: theme.colors.onSurface,
  },
  taskAddress: {
    color: theme.colors.outline,
    fontSize: 12,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: theme.colors.primary,
  },
  error: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 8,
  },
  photosSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  permissionInfo: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  permissionText: {
    fontSize: 12,
    color: theme.colors.outline,
    textAlign: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
  },
  photoCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  countText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  countNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  selectedPhotosContainer: {
    marginTop: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  photoItem: {
    position: 'relative',
    marginBottom: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.background,
    borderWidth: 2,
  },
  removePhotoText: {
    color: theme.colors.onError,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 20
  },
  button: {
    flex: 1,
  },
  hint: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 8,
  },
  requiredStar: {
    color: theme.colors.error,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: theme.colors.onSurfaceVariant,
  },
  // Добавьте в ReportFormStyles.ts
  notification: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    margin: 0,
    marginRight: 8,
  },
  notificationText: {
    color: 'white',
    fontWeight: '500',
    flex: 1,
  },
  maxPhotosText: {
    color: theme.colors.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 4,
  },
  photoButtonContent: {
    flexDirection: 'row-reverse',
  },
});