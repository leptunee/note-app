import { StyleSheet } from 'react-native';

export const inputStyles = StyleSheet.create({
  input: {
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  
  contentInput: {
    minHeight: 300,
    textAlignVertical: 'top',
    borderWidth: 0, // 确保无边框
  },
  
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
});
