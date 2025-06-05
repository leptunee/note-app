import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/components/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CategorySelectorModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onClose: () => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
}

export const CategorySelectorModal = memo<CategorySelectorModalProps>(({
  visible,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onClose,
  onAddCategory,
  onEditCategory,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // 缓存颜色主题
  const colors = useMemo(() => ({
    background: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    activeBackground: isDark ? '#333333' : '#e3f2fd',
    activeText: Colors[colorScheme].tint,
    dropdownBackground: isDark ? '#1a1a1a' : '#ffffff',
  }), [isDark, colorScheme]);

  // 缓存事件处理函数
  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  }, [onCategoryChange, onClose]);

  const handleAddCategory = useCallback(() => {
    if (onAddCategory) {
      onAddCategory();
    }
  }, [onAddCategory]);

  const handleEditCategory = useCallback((category: Category) => {
    if (category.id !== 'all' && category.id !== 'uncategorized' && onEditCategory) {
      onClose();
      onEditCategory(category);
    }
  }, [onEditCategory, onClose]);

  // 缓存过滤后的分类
  const selectableCategories = useMemo(() => 
    categories.filter(cat => cat.id !== 'all'), 
    [categories]
  );

  // 缓存样式对象
  const modalOverlayStyle = useMemo(() => [
    styles.modalOverlay,
    {
      paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0,
    }
  ], [insets.top]);

  const dropdownStyle = useMemo(() => [
    styles.dropdown, 
    { backgroundColor: colors.dropdownBackground }
  ], [colors.dropdownBackground]);

  const headerStyle = useMemo(() => [
    styles.header, 
    { borderBottomColor: colors.border }
  ], [colors.border]);

  const headerTitleStyle = useMemo(() => [
    styles.headerTitle, 
    { color: colors.text }
  ], [colors.text]);

  const footerStyle = useMemo(() => [
    styles.footer, 
    { borderTopColor: colors.border }
  ], [colors.border]);

  const addButtonStyle = useMemo(() => [
    styles.addButton,
    { backgroundColor: Colors[colorScheme].tint }
  ], [colorScheme]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {visible && (
        <StatusBar
          barStyle="light-content"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          translucent={true}
        />
      )}
      
      <TouchableOpacity
        style={modalOverlayStyle}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={dropdownStyle}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={headerStyle}>
            <Text style={headerTitleStyle}>
              {t('selectCategory', '选择分类')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome name="times" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
            {selectableCategories.map((category) => {
              const isSelected = category.id === selectedCategoryId;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: isSelected ? colors.activeBackground : 'transparent',
                    },
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  onLongPress={() => handleEditCategory(category)}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: isSelected ? category.color : colors.background,
                        borderColor: category.color,
                        borderWidth: isSelected ? 0 : 1,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={category.icon as any}
                      size={12}
                      color={isSelected ? '#ffffff' : category.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.optionName,
                      {
                        color: isSelected ? colors.activeText : colors.text,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                  {isSelected && (
                    <FontAwesome
                      name="check"
                      size={12}
                      color={colors.activeText}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {onAddCategory && (
            <View style={footerStyle}>
              <TouchableOpacity
                style={addButtonStyle}
                onPress={handleAddCategory}
              >
                <FontAwesome name="plus" size={14} color="#ffffff" />
                <Text style={styles.addButtonText}>
                  {t('addCategory', '新建分类')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dropdown: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionName: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
