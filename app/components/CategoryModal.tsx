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
  TouchableWithoutFeedback,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/components/useNotes';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';

interface CategoryModalProps {
  isVisible: boolean;
  category?: Category | null;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (categoryId: string) => void;
}

// 预定义的图标选项
const CATEGORY_ICONS = [
  'folder',      // 文件夹 - 最常用，排第一
  'briefcase',   // 工作/商务
  'user',        // 个人 - 替换原来的 file-text
  'graduation-cap', // 学习 - 替换原来的 tag
  'star',        // 收藏/重要
  'bookmark',    // 书签/标记
];

// 预定义的颜色选项
const CATEGORY_COLORS = [
  '#2196F3', // 蓝色
  '#FF9800', // 橙色
  '#4CAF50', // 绿色
  '#9C27B0', // 紫色
  '#F44336', // 红色
  '#607D8B', // 蓝灰色
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
  };  // 初始化表单数据
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
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              {/* 头部 */}
              <View style={[localStyles.header, { borderBottomColor: colors.border }]}>
                <Text style={[localStyles.headerTitle, { color: colors.text }]}>
                  {category ? t('editCategory', '编辑分类') : t('addCategory', '新建分类')}
                </Text>
                <TouchableOpacity style={localStyles.closeButton} onPress={onClose}>
                  <FontAwesome name="times" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView style={localStyles.content} showsVerticalScrollIndicator={false}>
                {/* 分类名称 */}
                <View style={localStyles.section}>
                  <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                    {t('categoryName', '分类名称')}
                  </Text>
                  <TextInput
                    style={[
                      localStyles.nameInput,
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
                    <Text style={localStyles.errorText}>{nameError}</Text>
                  ) : null}
                </View>

                {/* 图标选择 */}
                <View style={localStyles.section}>
                  <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                    {t('categoryIcon', '分类图标')}
                  </Text>
                  <View style={localStyles.iconGrid}>
                    {CATEGORY_ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}                        style={[
                          localStyles.iconOption,
                          {
                            backgroundColor:
                              selectedIcon === icon ? selectedColor : colors.surface,
                          },
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                      >                        <FontAwesome
                          name={icon as any}
                          size={16}
                          color={selectedIcon === icon ? '#ffffff' : colors.secondaryText}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>                {/* 颜色选择 */}
                <View style={localStyles.section}>
                  <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                    {t('categoryColor', '分类颜色')}
                  </Text>
                  <View style={localStyles.colorGrid}>
                    {CATEGORY_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          localStyles.colorOption,
                          {
                            backgroundColor: color,
                            borderColor: selectedColor === color ? colors.text : 'transparent',
                          },
                        ]}
                        onPress={() => setSelectedColor(color)}
                      >                        {selectedColor === color && (
                          <FontAwesome name="check" size={14} color="#ffffff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>              {/* 底部按钮 */}
              <View style={[localStyles.footer, { borderTopColor: colors.border }]}>
                <View style={localStyles.leftButtonContainer}>
                  {category && category.id !== 'all' && category.id !== 'uncategorized' && onDelete && (
                    <TouchableOpacity
                      style={[localStyles.deleteButton, localStyles.footerButton]}
                      onPress={handleDelete}
                    >
                      <FontAwesome name="trash" size={16} color="#F44336" />
                      <Text style={localStyles.deleteButtonText}>
                        {t('delete', '删除')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  style={[
                    localStyles.saveButton,
                    localStyles.footerButton,
                    { backgroundColor: Colors[colorScheme].tint },
                  ]}
                  onPress={handleSave}
                >
                  <Text style={localStyles.saveButtonText}>
                    {t('save', '保存')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
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
  },  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 280,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
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
  },  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },  iconOption: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 8,
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
  },  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  leftButtonContainer: {
    flex: 1,
  },
  footerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
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
  saveButton: {
    minWidth: 80,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
