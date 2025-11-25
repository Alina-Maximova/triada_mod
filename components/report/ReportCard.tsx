import React from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Card, Text, useTheme, Chip, IconButton, Menu } from 'react-native-paper';
import { Report } from '@/types/index';
import { reportService } from '@/services/report';
import { ReportStyles } from '@/styles/report/ReportStyles';

interface ReportCardProps {
  report: Report;
  onDelete: (report: Report) => void;
  deletingId?: number | null;
  
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  onDelete, 
  deletingId 
}) => {
  const theme = useTheme();
  const styles = ReportStyles(theme);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const handleDelete = () => {
    setMenuVisible(false);
    onDelete(report);
  };
  console.log(report)

  return (
    <Card style={styles.reportCard} mode="elevated">
      <Card.Content>
        {/* Заголовок с меню действий */}
        <View style={styles.reportHeader}>
          <Text variant="titleMedium" style={styles.reportTitle}>
            {report.task_title}
          </Text>
          <View style={styles.headerActions}>
            <Chip mode="outlined" style={styles.dateChip}>
              {formatDate(report.created_at)}
            </Chip>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >

              <Menu.Item
                leadingIcon="delete"
                onPress={handleDelete}
                title="Удалить"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.customerText}>
          Заказчик: {report.customer}
        </Text>

        {report.address && (
          <Text variant="bodySmall" style={styles.addressText}>
            Адрес: {report.address}
          </Text>
        )}

        <Text variant="bodyMedium" style={styles.description}>
         Описание: {report.description}
        </Text>

        {report.photo_urls && report.photo_urls.length > 0 && (
          <View style={styles.photosSection}>
            <Text variant="titleSmall" style={styles.photosTitle}>
              Фотографии ({report.photo_urls.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {report.photo_urls.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: reportService.getPhotoUrl(photo) }}
                    style={styles.photo}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Индикатор загрузки при удалении */}
        {deletingId === report.id && (
          <View style={styles.deletingOverlay}>
            <Text style={styles.deletingText}>Удаление...</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};