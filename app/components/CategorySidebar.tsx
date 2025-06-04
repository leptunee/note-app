// 分类目录侧边栏组件
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  useColorScheme,
  Dimensions,
  BackHandler,
  PanResponder,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/components/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface CategorySidebarProps {
  isVisible: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  onClose: () => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  slideAnimation: Animated.Value;
  notesCounts: { [categoryId: string]: number };
}

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.75; // 侧边栏宽度为屏幕宽度的75%

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  isVisible,
  categories,
  selectedCategoryId,
  onCategorySelect,
  onClose,
  onAddCategory,
  onEditCategory,
  slideAnimation,
  notesCounts,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    surface: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    activeBackground: isDark ? '#333333' : '#e3f2fd',
    activeText: Colors[colorScheme].tint,
  };
  // 处理硬件返回键
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true; // 阻止默认行为
      }
      return false; // 允许默认行为
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isVisible, onClose]);  // 处理滑动手势
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 只有当水平滑动距离大于垂直滑动距离时才响应
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // 停止任何正在进行的动画
      slideAnimation.stopAnimation();
    },
    onPanResponderMove: (evt, gestureState) => {
      // 只允许向左滑动（dx < 0）
      if (gestureState.dx < 0) {
        const progress = Math.abs(gestureState.dx) / SIDEBAR_WIDTH;
        const clampedProgress = Math.min(progress, 1);
        // 直接设置动画值，跟随手势移动
        slideAnimation.setValue(1 - clampedProgress);
      }
    },    onPanResponderRelease: (evt, gestureState) => {
      // 调整关闭阈值到30%，并保留速度检测
      const dragDistance = Math.abs(gestureState.dx);
      const dragVelocity = Math.abs(gestureState.vx);      const shouldClose = 
        (dragDistance > SIDEBAR_WIDTH * 0.3 && gestureState.dx < 0) || // 距离阈值：30%
        (dragVelocity > 0.3 && gestureState.dx < 0); // 降低速度阈值到0.3，更容易触发
      
      if (shouldClose) {
        // 优化动画速度：稍微增加动画时长
        const currentProgress = 1 - (dragDistance / SIDEBAR_WIDTH);
        const remainingDistance = currentProgress;
        
        // 调整动画时长：最短30ms，最长120ms
        const baseSpeed = dragVelocity > 1 ? 30 : 40; // 高速滑动时稍快
        const animationDuration = Math.max(baseSpeed, Math.min(120, remainingDistance * 200));
        
        // 开始关闭动画
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: false,
        }).start();
        
        // 更快的回调延迟
        setTimeout(() => {
          onClose();
        }, Math.min(50, animationDuration * 0.6));
      } else {
        // 回弹到打开状态，使用更快的弹簧动画
        Animated.spring(slideAnimation, {
          toValue: 1,
          tension: 120, // 增加张力，更快回弹
          friction: 7,  // 减少阻尼，更快到位
          useNativeDriver: false,
        }).start();
      }
    },
  });
  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      {/* 背景遮罩 */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
        {/* 侧边栏内容 */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.background,
            transform: [
              {
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-SIDEBAR_WIDTH, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* 头部 */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('categories', '分类目录')}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <FontAwesome name="times" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>        {/* 分类列表 */}
        <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
          {categories.map((category, index) => {
            const isSelected = category.id === selectedCategoryId;
            const notesCount = notesCounts[category.id] || 0;
            
            // 默认分类ID列表
            const defaultCategoryIds = ['all', 'uncategorized', 'work', 'personal', 'study'];
            const isDefaultCategory = defaultCategoryIds.includes(category.id);
            
            // 判断是否需要显示分割线（在最后一个默认分类后面，且有自定义分类的情况下）
            const nextCategory = categories[index + 1];
            const shouldShowDivider = isDefaultCategory && 
              nextCategory && 
              !defaultCategoryIds.includes(nextCategory.id);
            
            return (
              <React.Fragment key={category.id}>
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected ? colors.activeBackground : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onCategorySelect(category.id);
                    onClose();
                  }}
                  onLongPress={() => {
                    // 不允许编辑系统分类
                    if (category.id !== 'all' && category.id !== 'uncategorized') {
                      onEditCategory(category);
                    }
                  }}
                >
                  <View style={styles.categoryContent}>
                    <View style={styles.categoryLeft}>
                      <View
                        style={[
                          styles.categoryIcon,
                          {
                            backgroundColor: isSelected ? category.color : colors.surface,
                          },
                        ]}
                      >
                        <FontAwesome
                          name={category.icon as any}
                          size={16}
                          color={isSelected ? '#ffffff' : category.color}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          {
                            color: isSelected ? colors.activeText : colors.text,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {category.name}
                      </Text>
                    </View>
                    
                    <View style={styles.categoryRight}>
                      <Text
                        style={[
                          styles.notesCount,
                          {
                            color: isSelected ? colors.activeText : colors.secondaryText,
                          },
                        ]}
                      >
                        {notesCount}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {/* 分割线 */}
                {shouldShowDivider && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>

        {/* 底部操作按钮 */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: Colors[colorScheme].tint,
              },
            ]}
            onPress={onAddCategory}
          >
            <FontAwesome name="plus" size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>
              {t('addCategory', '新建分类')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  categoriesList: {
    flex: 1,
    paddingVertical: 8,
  },
  categoryItem: {
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryRight: {
    marginLeft: 8,
  },  notesCount: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
