// 性能优化版本的分类侧边栏组件
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  BackHandler,
  useColorScheme,
  ListRenderItem
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Category } from '@/src/hooks/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { styles } from '../../styles';

interface CategorySidebarProps {
  isVisible: boolean;
  categories: Category[];
  selectedCategoryId: string;
  notesCounts: { [key: string]: number };
  onClose: () => void;
  onCategorySelect: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onAddCategory: () => void;
}

// 分类项的高度，用于 FlatList 优化
const CATEGORY_ITEM_HEIGHT = 56;

export const CategorySidebar = memo<CategorySidebarProps>(({
  isVisible,
  categories,
  selectedCategoryId,
  notesCounts,
  onClose,
  onCategorySelect,
  onEditCategory,
  onAddCategory
}) => {
  const { t } = useTranslation();
  const slideAnimation = useRef(new Animated.Value(0)).current;
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

  // 缓存默认分类 ID
  const defaultCategoryIds = useMemo(() => ['all', 'uncategorized', 'work', 'personal', 'study'], []);

  // 使用 useCallback 缓存事件处理函数
  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategorySelect(categoryId);
    onClose();
  }, [onCategorySelect, onClose]);

  const handleEditCategory = useCallback((category: Category) => {
    // 不允许编辑系统分类
    if (category.id !== 'all' && category.id !== 'uncategorized') {
      onEditCategory(category);
    }
  }, [onEditCategory]);

  // 缓存分类渲染项
  const renderCategoryItem = useCallback<ListRenderItem<Category>>(({ item: category }) => {
    const isSelected = category.id === selectedCategoryId;
    const notesCount = notesCounts[category.id] || 0;
    const isDefaultCategory = defaultCategoryIds.includes(category.id);

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          {
            backgroundColor: isSelected ? colors.activeBackground : 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            height: CATEGORY_ITEM_HEIGHT,
            justifyContent: 'center',
            paddingHorizontal: 16,
          }
        ]}
        onPress={() => handleCategorySelect(category.id)}
        onLongPress={() => !isDefaultCategory && handleEditCategory(category)}
      >
        <View style={styles.categoryItemContent}>
          <View style={styles.categoryLeft}>
            <FontAwesome
              name={category.icon}
              size={18}
              color={isSelected ? colors.activeText : category.color}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[
                styles.categoryName,
                {
                  color: isSelected ? colors.activeText : colors.text,
                  fontSize: 16,
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
                fontSize: 14,
                fontWeight: '500',
              }
            ]}
          >
            {notesCount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [selectedCategoryId, notesCounts, defaultCategoryIds, colors, t, handleCategorySelect, handleEditCategory]);

  // 缓存关键提取器
  const keyExtractor = useCallback((item: Category) => item.id, []);

  // 缓存 getItemLayout
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: CATEGORY_ITEM_HEIGHT,
    offset: CATEGORY_ITEM_HEIGHT * index,
    index,
  }), []);

  // 处理动画
  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnimation, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible, slideAnimation]);

  // 处理硬件返回键
  useEffect(() => {
    const backAction = () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isVisible, onClose]);

  // 手势处理
  const onHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -100) {
        onClose();
      } else {
        Animated.spring(slideAnimation, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [onClose, slideAnimation]);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor: colors.background,
              transform: [{
                translateX: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-Dimensions.get('window').width * 0.75, 0],
                })
              }]
            }
          ]}
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
            // 性能优化
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={8}
            windowSize={5}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
});

CategorySidebar.displayName = 'CategorySidebar';
