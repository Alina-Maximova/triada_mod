import { StyleSheet } from 'react-native';

export const AuthScreenStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  demoCard: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  demoTitle: {
    marginBottom: 8,
    color: theme.colors.primary,
  },
    documentationContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  documentationText: {
    marginBottom: 12,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  documentationButton: {
    marginVertical: 4,
  },
});