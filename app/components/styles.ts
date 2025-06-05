import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const styles = StyleSheet.create({  // 容器相关样式
  container: {
    flex: 1,
    paddingTop: 60, // 增加顶部间距，为状态栏留出空间
    paddingBottom: 0, // 移除底部间距，让内容可以延伸到屏幕边缘
  },
  
  // 页面设置相关样式
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },  optionGrid: {
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
  },  // 头部样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16, // 添加水平padding
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  contentInput: {
    minHeight: 300,
    textAlignVertical: 'top',
    borderWidth: 0, // 确保无边框
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
    paddingTop: 0, // 确保覆盖状态栏
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
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
    textAlign: 'center'
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
    // 新增背景图片样式
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -1, // 确保在内容之下
  },  // OptionsMenu 背景遮罩样式
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
