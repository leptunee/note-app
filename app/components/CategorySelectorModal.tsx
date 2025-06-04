// 分类选择模态框组件 - 专门用于在笔记编辑页面显示
import React from 'react';
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
import { Category } from '@/components/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface CategorySelectorModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onClose: () => void;
  onAddCategory?: () => void;
}

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  visible,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onClose,
  onAddCategory,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    activeBackground: isDark ? '#333333' : '#e3f2fd',
    activeText: Colors[colorScheme].tint,
    dropdownBackground: isDark ? '#1a1a1a' : '#ffffff',
  };
  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  // 过滤掉"全部笔记"分类，只显示可选择的分类
  const selectableCategories = categories.filter(cat => cat.id !== 'all');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.dropdown, { backgroundColor: colors.dropdownBackground }]}>
          {/* 头部 */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('selectCategory', '选择分类')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome name="times" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>          {/* 分类列表 */}
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

          {/* 底部按钮 */}
          {onAddCategory && (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: Colors[colorScheme].tint }
                ]}
                onPress={() => {
                  onClose();
                  onAddCategory();
                }}
              >
                <FontAwesome name="plus" size={14} color="#ffffff" />
                <Text style={styles.addButtonText}>
                  {t('addCategory', '新建分类')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
