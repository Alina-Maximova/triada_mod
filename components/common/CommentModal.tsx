// components/common/CommentModal.tsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, Button, TextInput, useTheme, Portal, Dialog } from 'react-native-paper';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (comment: string) => void;
  title?: string;
  placeholder?: string;
  required?: boolean;
  isLoading?: boolean;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  onSave,
  title = 'Добавить комментарий',
  placeholder = 'Введите комментарий...',
  required = false,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) {
      setComment('');
    }
  }, [visible]);

  const handleSave = async () => {
    if (required && !comment.trim()) {
      return;
    }
    
    try {
      await onSave(comment.trim());
      // Закрываем модальное окно после успешного сохранения
      handleClose();
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
      console.error('Error saving comment:', error);
    }
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  const isSaveDisabled = !comment.trim() || isLoading;

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={{ borderRadius: 12 }}>
        <Dialog.Title style={{ textAlign: 'center' }}>
          {title}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            placeholder={placeholder}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={{ minHeight: 120 }}
            outlineStyle={{ borderRadius: 8 }}
            error={required && !comment.trim()}
          />
          {required && !comment.trim() && (
            <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
              Обязательное поле для этого действия
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions style={{ 
          justifyContent: 'space-between', 
          paddingHorizontal: 24 
        }}>
          <Button 
            mode="outlined" 
            onPress={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSave}
            disabled={isSaveDisabled}
            loading={isLoading}
          >
            Сохранить
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};