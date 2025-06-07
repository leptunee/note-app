// 分类目录侧边栏组件 - Performance Optimized
import React, { useEffect, memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  useColorScheme,
  Dimensions,
  BackHandler,
  PanResponder,
  ListRenderItem,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/src/hooks/useNotes';
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
const CATEGORY_ITEM_HEIGHT = 56; // 分类项固定高度

export const CategorySidebar = memo<CategorySidebarProps>(({
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
  
  // 缓存颜色配置
  const colors = useMemo(() => {
    const isDark = colorScheme === 'dark';
    return {
      background: isDark ? '#1a1a1a' : '#ffffff',
      surface: isDark ? '#2a2a2a' : '#f8f9fa',
      text: isDark ? '#ffffff' : '#000000',
      secondaryText: isDark ? '#cccccc' : '#666666',
      border: isDark ? '#404040' : '#e0e0e0',
      activeBackground: isDark ? '#333333' : '#e3f2fd',
      activeText: Colors[colorScheme].tint,
    };
  }, [colorScheme]);

  // 缓存系统分类ID
  const systemCategoryIds = useMemo(() => ['all', 'uncategorized'], []);

  // 缓存事件处理函数
  const handleCategoryPress = useCallback((categoryId: string) => {
    onCategorySelect(categoryId);
    onClose();
  }, [onCategorySelect, onClose]);

  const handleCategoryLongPress = useCallback((category: Category) => {
    if (!systemCategoryIds.includes(category.id)) {
      onEditCategory(category);
    }
  }, [onEditCategory, systemCategoryIds]);

  // 渲染分类项
  const renderCategoryItem = useCallback<ListRenderItem<Category>>(({ item: category }) => {
    const isSelected = category.id === selectedCategoryId;
    const notesCount = notesCounts[category.id] || 0;
    const isSystemCategory = systemCategoryIds.includes(category.id);

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          {
            backgroundColor: isSelected ? colors.activeBackground : 'transparent',
            borderBottomColor: colors.border,
          }
        ]}
        onPress={() => handleCategoryPress(category.id)}
        onLongPress={() => handleCategoryLongPress(category)}
        delayLongPress={500}
      >
        <View style={styles.categoryContent}>
          <View style={styles.categoryLeft}>
            <FontAwesome
              name={category.icon as any}
              size={18}
              color={isSelected ? colors.activeText : category.color}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryName,
                {
                  color: isSelected ? colors.activeText : colors.text,
                  fontWeight: isSelected ? '600' : '400',
                }
              ]}
              numberOfLines={1}
            >
              {String(t(`category.${category.id}`, category.name))}
            </Text>
          </View>
          <Text
            style={[
              styles.categoryCount,
              {
                color: isSelected ? colors.activeText : colors.secondaryText,
              }
            ]}
          >
            {notesCount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [
    selectedCategoryId,
    notesCounts,
    systemCategoryIds,
    colors,
    t,
    handleCategoryPress,
    handleCategoryLongPress,
  ]);

  // 键提取器
  const keyExtractor = useCallback((item: Category) => item.id, []);

  // getItemLayout 优化
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: CATEGORY_ITEM_HEIGHT,
    offset: CATEGORY_ITEM_HEIGHT * index,
    index,
  }), []);

  // 创建平移响应器
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        slideAnimation.setValue(1 + gestureState.dx / SIDEBAR_WIDTH);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -SIDEBAR_WIDTH * 0.3) {
        onClose();
      } else {
        Animated.spring(slideAnimation, {
          toValue: 1,
          useNativeDriver: false,
          tension: 120,
          friction: 7,
        }).start();
      }
    },
  }), [slideAnimation, onClose]);

  // 处理硬件返回键
  useEffect(() => {
    if (!isVisible) return;

    const backAction = () => {
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.background,
            transform: [{
              translateX: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-SIDEBAR_WIDTH, 0],
              })
            }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>
            {String(t('categories', '分类'))}
          </Text>
          <TouchableOpacity onPress={onAddCategory}>
            <FontAwesome name="plus" size={20} color={colors.activeText} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          // 性能优化属性
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={8}
          windowSize={5}
        />
      </Animated.View>
    </View>
  );
});

CategorySidebar.displayName = 'CategorySidebar';

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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoryItem: {
    height: CATEGORY_ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
    width: 18,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
