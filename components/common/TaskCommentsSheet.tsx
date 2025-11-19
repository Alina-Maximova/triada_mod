// components/task/TaskCommentsSheet.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { Text, Button, IconButton, useTheme, ActivityIndicator, Divider, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Task, Comment } from '@/types/index';
import { TaskCommentsStyles } from '@/styles/task/TaskCommentsStyles';
import { CommentModal } from '@/components/common/CommentModal';
import { useComments } from '@/hooks/useComments';

interface TaskCommentsSheetProps {
  task: Task | null;
  sheetRef: React.RefObject<BottomSheet>;
  onClose: () => void;
  onChange?: (index: number) => void;
}

export const TaskCommentsSheet: React.FC<TaskCommentsSheetProps> = ({
  task,
  sheetRef,
  onClose,
  onChange,
}) => {
  const theme = useTheme();
  const styles = TaskCommentsStyles(theme);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Используем хук для комментариев
  const { 
    comments, 
    isLoading, 
    error, 
    refreshComments,
    addComment 
  } = useComments();

  // Сортируем комментарии от новых к старым
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [comments]);

  const snapPoints = React.useMemo(() => ['60%', '90%'], []);

  // ФИКС: Правильный обработчик изменения шторки
  const handleSheetChange = useCallback((index: number) => {
    console.log('Шторка комментариев изменила состояние:', index);
    if (onChange) {
      onChange(index);
    }
  }, [onChange]);

  // Загружаем комментарии при открытии шторки
  useEffect(() => {
    if (task) {
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    
    try {
      await refreshComments(task.id);
    } catch (error) {
      console.error('Error loading comments:', error);
      setSnackbarMessage('Ошибка загрузки комментариев');
    }
  };

  const handleCommentSave = async (commentText: string) => {
    if (!task) return;
    
    try {
      await addComment({
        task_id: task.id,
        content: commentText
      });
      
      setCommentModalVisible(false);
      setSnackbarMessage('Комментарий добавлен');
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbarMessage('Ошибка добавления комментария');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCommentItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text variant="bodySmall" style={styles.commentDate}>
          {formatDate(item.created_at)}
        </Text>
        {item.user_name && (
          <Text variant="bodySmall" style={styles.commentAuthor}>
            {item.user_name}
          </Text>
        )}
      </View>
      <Text variant="bodyMedium" style={styles.commentText}>
        {item.content}
      </Text>
      
      <Divider style={styles.commentDivider} />
    </View>
  );

  const renderEmptyComments = () => (
    <View style={styles.emptyCommentsContainer}>
      <MaterialIcons name="chat-bubble-outline" size={48} color={theme.colors.outline} />
      <Text variant="titleMedium" style={styles.emptyCommentsTitle}>
        Нет комментариев
      </Text>
      <Text variant="bodyMedium" style={styles.emptyCommentsText}>
        Будьте первым, кто оставит комментарий к этой задаче
      </Text>
    </View>
  );

  if (!task) return null;

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
          <View style={styles.sheetTitleContainer}>
            <Text variant="headlineSmall" style={styles.sheetTitle} numberOfLines={1}>
              Комментарии
            </Text>
            <Text variant="bodyMedium" style={styles.sheetSubtitle} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
          />
        </View>

        <BottomSheetFlatList
          data={sortedComments} // Используем отсортированные комментарии
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.commentsListContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadComments}
          ListEmptyComponent={!isLoading ? renderEmptyComments : null}
          ListHeaderComponent={
            <View style={styles.commentsHeader}>
              <Text variant="titleMedium" style={styles.commentsCount}>
                Комментарии ({sortedComments.length}) {/* Используем длину отсортированного массива */}
              </Text>
              {error && (
                <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                  {error}
                </Text>
              )}
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
            ) : null
          }
        />

        <View style={styles.sheetActions}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.sheetButton}
          >
            Закрыть
          </Button>
          <Button
            mode="contained"
            onPress={() => setCommentModalVisible(true)}
            style={styles.sheetButton}
            icon="comment-plus"
            loading={isLoading}
          >
            Добавить комментарий
          </Button>
        </View>
      </BottomSheet>

      {/* Модальное окно для добавления комментариев */}
      <CommentModal
        visible={commentModalVisible}
        onClose={() => setCommentModalVisible(false)}
        onSave={handleCommentSave}
        title="Добавить комментарий"
        placeholder="Введите ваш комментарий к задаче..."
        required={false}
        isLoading={isLoading}
      />

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
    </>
  );
};