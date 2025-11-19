// components/task/StatusChip.tsx
import React from 'react';
import { Chip, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/styles/theme';

interface StatusChipProps {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const theme = useTheme() as AppTheme;
  
  const getStatusConfig = (stat: string) => {
    switch (stat) {
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

  const config = getStatusConfig(status);

  return (
    <Chip
      mode="outlined"
      icon={config.icon}
      textStyle={[
        styles.chipText,
        { color: config.color }
      ]}
      style={[
        styles.statusChip, 
        { 
          borderColor: config.color,
          backgroundColor: config.backgroundColor
        }
      ]}
    >
      {config.label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  statusChip: {
    height: 28,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});