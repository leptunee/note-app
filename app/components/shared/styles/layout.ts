import { StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // 增加顶部间距，为状态栏留出空间
    paddingBottom: 0, // 移除底部间距，让内容可以延伸到屏幕边缘
  },
  
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
  
  scrollView: {
    flex: 1,
  },
  
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -1, // 确保在内容之下
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
