import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { styles } from '../../styles';
import { ExportView } from '../export/ExportView';
import { TitleSection } from './TitleSection';
import { EditorComponent } from './EditorComponent';
import { CategorySelectorModal } from '../categories/CategorySelectorModal';
import { useEditorContent } from '@/src/hooks/useEditorContent';
import { formatDate as getFormattedDate, getPlainTextLength, calculateContentHeight } from '@/src/utils/contentUtils';
import { Category } from '@/src/hooks/useNotes';

interface RichTextContentProps {
  title: string;
  content: string;
  onChangeContent: (html: string) => void;
  onChangeTitle: (text: string) => void;
  noteViewRef: React.RefObject<any>;
  textColor?: string;
  editorBackgroundColor?: string;  editorBorderColor?: string;
  maxLength?: number;
  titleError?: string;
  editor: any;
  titleInputRef?: React.RefObject<TextInput | null>;
  // 分类相关props
  categories: Category[];
  selectedCategoryId: string;  onCategoryChange: (categoryId: string) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;  // 标题焦点处理
  onTitleFocus?: () => void;
  onTitleBlur?: () => void;  // 工具栏状态
  isToolbarVisible?: boolean;
  isKeyboardVisible?: boolean;
}

export const RichTextContent = memo<RichTextContentProps>(({
  title,
  content,
  onChangeContent,
  onChangeTitle,
  noteViewRef,
  textColor,
  maxLength,
  titleError,
  editor,
  titleInputRef,
  categories,
  selectedCategoryId,  onCategoryChange,  onAddCategory,
  onEditCategory,
  onTitleFocus,  onTitleBlur,
  isToolbarVisible = false,
  isKeyboardVisible = false,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  // 创建内部引用，如果没有传入外部引用的话
  const internalTitleRef = useRef<TextInput | null>(null);
  const finalTitleRef = titleInputRef || internalTitleRef;
  // 使用自定义 Hook 管理编辑器内容
  const { getCurrentContent, forceReloadContent } = useEditorContent({
    editor,
    initialContent: content,
    onContentChange: onChangeContent,
    debounceMs: 500
  });

  // 缓存当前选中的分类
  const selectedCategory = useMemo(() => 
    categories.find(cat => cat.id === selectedCategoryId) || 
    { id: 'uncategorized', name: '未分类', icon: 'folder', color: '#999999', createdAt: 0, updatedAt: 0 },
    [categories, selectedCategoryId]
  );

  // 使用 useCallback 缓存事件处理函数
  const handleCategoryPress = useCallback(() => {
    setShowCategorySelector(true);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategoryChange(categoryId);
    setShowCategorySelector(false);
  }, [onCategoryChange]);
  const handleCloseCategorySelector = useCallback(() => {
    setShowCategorySelector(false);
  }, []);

  return (
    <View style={styles.contentContainer}>      {/* 标题和元数据部分 */}
      <TitleSection
        ref={finalTitleRef}
        title={title}
        onChangeTitle={onChangeTitle}
        content={content}
        textColor={textColor}
        maxLength={maxLength}
        titleError={titleError}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
        onFocus={onTitleFocus}
        onBlur={onTitleBlur}
      />      {/* 富文本编辑器 */}
      <EditorComponent
        editor={editor}
        content={content}
        isToolbarVisible={isToolbarVisible}
        isKeyboardVisible={isKeyboardVisible}
      />{/* 分类选择器模态框 - 只在需要时显示 */}
      <CategorySelectorModal
        visible={showCategorySelector}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategorySelect}
        onClose={handleCloseCategorySelector}
        onAddCategory={onAddCategory}
        onEditCategory={onEditCategory}
      />    </View>
  );
});
