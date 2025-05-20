import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const styles = StyleSheet.create({
  // 容器相关样式
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60, // 增加顶部间距，为状态栏留出空间
  },
  
  // 头部样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 输入框样式
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  contentInput: {
    minHeight: 300,
    textAlignVertical: 'top',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  
  // 按钮样式
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
  
  // 导出模态框样式
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginBottom: 16,
    paddingBottom: 12,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
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
    fontSize: 16
  },
  
  // 导出按钮样式
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
  
  // 用于截图的容器样式
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
  
  // 选项菜单样式
  optionsMenuContainer: {
    position: 'relative',
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
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
    width: 22,
    marginRight: 12,
    textAlign: 'center'
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  }
});
