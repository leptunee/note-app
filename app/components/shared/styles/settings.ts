import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const settingsStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  aspectRatioOption: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 40,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  
  themeOption: {
    width: '47%',
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
  },
  
  marginOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  marginOption: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    width: '30%',
  },
  
  selectedMargin: {
    borderColor: Colors.light.tint,
    borderWidth: 2,
  },
  
  marginPreview: {
    width: 50,
    height: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  marginInner: {
    backgroundColor: '#aaa',
    width: '100%',
    height: '100%',
  },
  
  pageSettingsButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 1,
  },
});
