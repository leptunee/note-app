// 标题和信息栏组件
import React, { forwardRef } from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, getPlainTextLength } from './utils/contentUtils';
import { styles } from './styles';

interface TitleSectionProps {
  title: string;
  content: string;
  onChangeTitle: (text: string) => void;
  textColor?: string;
  maxLength?: number;
  titleError?: string;
  lastEditedAt?: number;
}

export const TitleSection = forwardRef<TextInput, TitleSectionProps>(({
  title,
  content,
  onChangeTitle,
  textColor,
  maxLength,
  titleError,
  lastEditedAt
}, ref) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <>
      {/* 标题输入区域 */}
      <TextInput
        ref={ref}        style={[
          {
            backgroundColor: 'transparent',
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            paddingHorizontal: 0,
            paddingVertical: 4,
            fontSize: 20, // 减小字体以确保64字符能在3行内显示
            fontWeight: 'bold',
            marginBottom: 2,
            minHeight: 32, // 确保至少有一行的高度
            textAlignVertical: 'top', // 文本从顶部开始对齐
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        multiline={true}
        scrollEnabled={false}
        numberOfLines={3} // 最多显示3行，超过后可以滚动
      />

      {/* 日期和字数统计 */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 0, 
        marginBottom: 2
      }}>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {lastEditedAt ? `${t('lastEdited')}: ${formatDate(lastEditedAt)}` : formatDate()}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {getPlainTextLength(content)} {getPlainTextLength(content) > 0 ? String(t('characters')) : String(t('character'))}
        </Text>
      </View>

      {/* 错误提示 */}
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
    </>
  );
});
