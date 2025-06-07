import { StyleSheet } from 'react-native';

export const menuStyles = StyleSheet.create({
  optionsMenuContainer: {
    position: 'relative',
  },
  
  optionsButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  optionsMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 160,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  
  optionIcon: {
    width: 24,
    marginRight: 12,
    textAlign: 'center',
  },
  
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  backdrop: {
    position: 'absolute',
    top: -1000, // 向上扩展覆盖范围
    left: -1000, // 向左扩展覆盖范围
    right: -1000, // 向右扩展覆盖范围
    bottom: -1000, // 向下扩展覆盖范围
    backgroundColor: 'transparent',
    zIndex: 998, // 确保在菜单下方但在其他内容上方
  },
});
