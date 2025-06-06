// 标题和信息栏组件
import React, { forwardRef, memo, useMemo } from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getPlainTextLength } from './utils/contentUtils';
import { styles } from './styles';
import { CategoryDisplay } from './CategoryDisplay';
import { Category } from '@/components/useNotes';

interface TitleSectionProps {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  textColor?: string;
  maxLength?: number;
  titleError?: string;
  selectedCategory?: Category;
  onCategoryPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TitleSection = memo(forwardRef<TextInput, TitleSectionProps>(({
  title,
  content,
  onChangeTitle,
  textColor,
  maxLength,
  titleError,
  selectedCategory,
  onCategoryPress,
  onFocus,
  onBlur
}, ref) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

  // 缓存文本输入样式
  const textInputStyle = useMemo(() => [
    {
      backgroundColor: 'transparent',
      color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
      paddingHorizontal: 0,
      paddingVertical: 4,
      fontSize: 20,
      fontWeight: 'bold' as const,
      marginBottom: 2,
      minHeight: 32,
      textAlignVertical: 'top' as const,
    }
  ], [textColor, colorScheme]);

  // 缓存占位符颜色
  const placeholderTextColor = useMemo(() => 
    colorScheme === 'dark' ? '#888' : '#888', 
    [colorScheme]
  );

  // 缓存容器样式
  const containerStyle = useMemo(() => ({ 
    flexDirection: 'row' as const, 
    justifyContent: 'space-between' as const, 
    alignItems: 'center' as const,
    paddingHorizontal: 0, 
    marginBottom: 2
  }), []);

  // 缓存字数统计样式
  const wordCountStyle = useMemo(() => ({ 
    color: colorScheme === 'dark' ? '#999' : '#888', 
    fontSize: 12 
  }), [colorScheme]);

  // 缓存字数
  const characterCount = useMemo(() => getPlainTextLength(content), [content]);

  // 缓存字数文本
  const characterText = useMemo(() => 
    `${characterCount} ${characterCount > 0 ? String(t('characters')) : String(t('character'))}`,
    [characterCount, t]
  );  return (
    <>      {/* 标题输入区域 */}
      <TextInput
        ref={ref}
        style={textInputStyle}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={placeholderTextColor}
        multiline={true}
        scrollEnabled={false}
        numberOfLines={3}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {/* 分类显示和字数统计 */}
      <View style={containerStyle}>
        {/* 分类显示 - 左侧 */}
        {selectedCategory && onCategoryPress ? (
          <CategoryDisplay
            category={selectedCategory}
            onPress={onCategoryPress}
            textColor={colorScheme === 'dark' ? '#999' : '#888'}
          />
        ) : (
          <View /> // 占位元素，保持布局
        )}
        
        {/* 字数统计 - 右侧 */}
        <Text style={wordCountStyle}>
          {characterText}
        </Text>
      </View>

      {/* 错误提示 */}
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
    </>
  );
}));
