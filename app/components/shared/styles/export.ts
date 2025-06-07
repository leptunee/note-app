import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const exportStyles = StyleSheet.create({
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginVertical: 4,
  },
  
  exportOptionText: {
    fontSize: 17,
    marginLeft: 15,
    fontWeight: '500',
  },
  
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint, // 使用应用主题色
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  
  printableContent: {
    width: '100%',
    minHeight: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
    noteHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  
  noteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
});
