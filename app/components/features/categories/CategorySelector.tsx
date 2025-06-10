// 分类选择组件
import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Modal,
  ScrollView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/src/hooks/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onAddCategory?: () => void; // 新增：添加分类回调
  showAddButton?: boolean; // 新增：是否显示添加按钮
}

export const CategorySelector = memo<CategorySelectorProps>(({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onAddCategory,
  showAddButton = true,
}) => {
  const { t } = useTranslation();  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 缓存颜色配置
  const colors = useMemo(() => ({
    background: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    activeBackground: isDark ? '#333333' : '#e3f2fd',
    activeText: Colors[colorScheme].tint,
    dropdownBackground: isDark ? '#1a1a1a' : '#ffffff',
  }), [isDark, colorScheme]);

  // 过滤掉"全部笔记"分类，只显示可选择的分类
  const selectableCategories = useMemo(() => 
    categories.filter(cat => cat.id !== 'all'), 
    [categories]
  );
  
  const selectedCategory = useMemo(() => 
    selectableCategories.find(cat => cat.id === selectedCategoryId) || selectableCategories[0],
    [selectableCategories, selectedCategoryId]
  );

  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategoryChange(categoryId);
    setShowDropdown(false);
  }, [onCategoryChange]);

  const handleDropdownToggle = useCallback(() => {
    setShowDropdown(true);
  }, []);

  const handleDropdownClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}
      >
        {t('category')}
      </Text>
      
      <View style={styles.selectorRow}>
        {/* 主要分类选择器 */}
        <TouchableOpacity
          style={[
            styles.selectorButton,
            { 
              backgroundColor: colors.dropdownBackground,
              borderColor: colors.border,
              flex: 1,
            }
          ]}
          onPress={handleDropdownToggle}
        >
          <View style={styles.selectedCategory}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: selectedCategory.color },
              ]}
            >
              <FontAwesome
                name={selectedCategory.icon as any}
                size={14}
                color="#ffffff"
              />
            </View>            <Text style={[styles.categoryName, { color: colors.text }]}>
              {['uncategorized', 'work', 'personal', 'study'].includes(selectedCategory.name) ? t(selectedCategory.name) : selectedCategory.name}
            </Text>
          </View>
          <FontAwesome 
            name="chevron-down" 
            size={14} 
            color={colors.secondaryText} 
          />
        </TouchableOpacity>

        {/* 添加分类按钮 */}
        {showAddButton && onAddCategory && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { 
                backgroundColor: Colors[colorScheme].tint,
                marginLeft: 8,
              }
            ]}
            onPress={onAddCategory}
          >
            <FontAwesome name="plus" size={14} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* 下拉选择模态框 */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDropdownClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleDropdownClose}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.dropdownBackground }]}
          >            <ScrollView style={styles.dropdownScroll} showsVerticalScrollIndicator={false}>
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
                      ]}                    >
                      {['allNotes', 'uncategorized', 'work', 'personal', 'study'].includes(category.name) ? t(category.name) : category.name}
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
          </View>
        </TouchableOpacity>
      </Modal>    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: {
    paddingVertical: 8,
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
});
