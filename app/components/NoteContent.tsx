import React from 'react';
import { View, ScrollView, Text, TextInput, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

interface NoteContentProps {
  title: string;
  content: string;
  onChangeContent: (text: string) => void;
  onChangeTitle: (text: string) => void; // 添加 onChangeTitle
  noteViewRef: React.RefObject<any>;
  textColor?: string; // 可选的文本颜色参数
  editorBackgroundColor?: string; // 编辑器背景色
  editorBorderColor?: string; // 编辑器边框色
  maxLength?: number; // 添加 maxLength
  titleError?: string; // 添加 titleError
}

interface NoteContentProps {
  title: string;
  content: string;
  onChangeContent: (text: string) => void;
  onChangeTitle: (text: string) => void;
  noteViewRef: React.RefObject<any>;
  textColor?: string;
  editorBackgroundColor?: string;
  editorBorderColor?: string;
  maxLength?: number;
  titleError?: string;
  lastEditedAt?: number; // 添加最后编辑时间属性
}

export const NoteContent: React.FC<NoteContentProps> = ({
  title,
  content,
  onChangeContent,
  onChangeTitle,
  noteViewRef,
  textColor,
  editorBackgroundColor,
  editorBorderColor,
  maxLength,
  titleError,
  lastEditedAt, // 添加最后编辑时间
}) => {  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  // 获取格式化的日期
  const getFormattedDate = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    
    // 自定义格式化为 YYYY/MM/DD HH:MM
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回 0-11
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    // 格式化为 YYYY/MM/DD HH:MM
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };
  
  return (
    <View style={styles.contentContainer}>
      {/* 隐藏的导出视图 - 仅用于导出图片 */}      <View 
        ref={noteViewRef} 
        collapsable={false} 
        style={[
          styles.printableContent, 
          { position: 'absolute', opacity: 0, width: 1, left: -9999, zIndex: -1 }
        ]}
      >        <View style={[styles.noteHeader, { backgroundColor: '#f8f8f8' }]}>
          <Text style={[styles.noteTitle, { color: '#000', fontSize: 24, fontWeight: 'bold' }]}>
            {title || String(t('untitledNote'))}
          </Text>        <Text style={[styles.noteDate, { color: '#666', marginTop: 4 }]}>
            {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
          </Text>
        </View>
        
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <Text style={{ color: '#000', fontSize: 16, lineHeight: 24 }}>
            {content || String(t('noContent'))}
          </Text>
        </View>
      </View>
        {/* 标题输入 - 无边框样式 */}
      <TextInput
        style={[
          {
            // 自定义标题输入样式 - 无边框
            backgroundColor: 'transparent', // 透明背景
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 24, // 稍微增大字号
            fontWeight: 'bold',
            marginBottom: 0,
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />      {/* 日期和字数统计 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 16 }}>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
        </Text>        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {content.length} {content.length > 0 ? String(t('characters')) : String(t('character'))}
        </Text>
      </View>
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}      {/* 实际编辑框 - 无边框样式 */}      <ScrollView style={styles.scrollView}>
        <TextInput
          style={[
            styles.contentInput, 
            { 
              backgroundColor: 'transparent', // 透明背景
              color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
              padding: 12,
              borderWidth: 0, // 移除边框
              fontSize: 16,
              lineHeight: 24,
            }
          ]}
          placeholder={String(t('content'))}
          value={content}
          onChangeText={onChangeContent}
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
          multiline
        />
      </ScrollView>
    </View>
  );
};
