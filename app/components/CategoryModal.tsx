// 分类管理模态框组件
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/components/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface CategoryModalProps {
  isVisible: boolean;
  category?: Category | null;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (categoryId: string) => void;
}

// 预定义的图标选项
const CATEGORY_ICONS = [
  'file-text',
  'briefcase',
  'user',
  'graduation-cap',
  'heart',
  'star',
  'bookmark',
  'tag',
  'folder',
  'home',
  'car',
  'plane',
  'camera',
  'music',
  'gamepad',
  'shopping-cart',
];

// 预定义的颜色选项
const CATEGORY_COLORS = [
  '#2196F3', // 蓝色
  '#FF9800', // 橙色
  '#4CAF50', // 绿色
  '#9C27B0', // 紫色
  '#F44336', // 红色
  '#607D8B', // 蓝灰色
  '#795548', // 棕色
  '#FF5722', // 深橙色
  '#3F51B5', // 靛蓝色
  '#009688', // 青色
  '#CDDC39', // 柠檬绿
  '#E91E63', // 粉红色
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  category,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [nameError, setNameError] = useState('');

  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    surface: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    inputBackground: isDark ? '#333333' : '#ffffff',
    inputBorder: isDark ? '#555555' : '#dddddd',
  };

  // 初始化表单数据
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
    } else {
      setName('');
      setSelectedIcon('folder');
      setSelectedColor('#2196F3');
    }
    setNameError('');
  }, [category, isVisible]);

  const handleSave = () => {
    // 验证输入
    if (!name.trim()) {
      setNameError(t('categoryNameRequired', '分类名称不能为空'));
      return;
    }

    if (name.trim().length > 20) {
      setNameError(t('categoryNameTooLong', '分类名称不能超过20个字符'));
      return;
    }

    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (!category || !onDelete) return;

    Alert.alert(
      t('confirmDelete', '确认删除'),
      t('confirmDeleteCategory', '确定要删除这个分类吗？该分类下的笔记将移动到"全部笔记"分类。'),
      [
        {
          text: t('cancel', '取消'),
          style: 'cancel',
        },
        {
          text: t('delete', '删除'),
          style: 'destructive',
          onPress: () => {
            onDelete(category.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* 头部 */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {category ? t('editCategory', '编辑分类') : t('addCategory', '新建分类')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome name="times" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 分类名称 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('categoryName', '分类名称')}
              </Text>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: nameError ? '#F44336' : colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError('');
                }}
                placeholder={t('enterCategoryName', '请输入分类名称')}
                placeholderTextColor={colors.secondaryText}
                maxLength={20}
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            {/* 图标选择 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('categoryIcon', '分类图标')}
              </Text>
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor:
                          selectedIcon === icon ? selectedColor : colors.surface,
                        borderColor: selectedIcon === icon ? selectedColor : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <FontAwesome
                      name={icon as any}
                      size={20}
                      color={selectedIcon === icon ? '#ffffff' : colors.secondaryText}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 颜色选择 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('categoryColor', '分类颜色')}
              </Text>
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderColor: selectedColor === color ? colors.text : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <FontAwesome name="check" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 预览 */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('preview', '预览')}
              </Text>
              <View style={[styles.preview, { backgroundColor: colors.surface }]}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: selectedColor },
                  ]}
                >
                  <FontAwesome
                    name={selectedIcon as any}
                    size={16}
                    color="#ffffff"
                  />
                </View>
                <Text style={[styles.previewName, { color: colors.text }]}>
                  {name || t('categoryName', '分类名称')}
                </Text>
              </View>
            </View>
          </ScrollView>          {/* 底部按钮 */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {category && category.id !== 'all' && category.id !== 'uncategorized' && onDelete && (
              <TouchableOpacity
                style={[styles.deleteButton, styles.footerButton]}
                onPress={handleDelete}
              >
                <FontAwesome name="trash" size={16} color="#F44336" />
                <Text style={styles.deleteButtonText}>
                  {t('delete', '删除')}
                </Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.footerRightButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, styles.footerButton]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
                  {t('cancel', '取消')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  styles.footerButton,
                  { backgroundColor: Colors[colorScheme].tint },
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {t('save', '保存')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  footerRightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    minWidth: 80,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
