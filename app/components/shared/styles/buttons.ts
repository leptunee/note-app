import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const buttonStyles = StyleSheet.create({
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  
  headerIconButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
  },
  
  iconButton: {
    padding: 5,
  },
  
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  
  closeButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  
  pageSettingsButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1,
  },
  
  optionsButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
