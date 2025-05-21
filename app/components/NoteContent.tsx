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

export const NoteContent: React.FC<NoteContentProps> = ({
  title,
  content,
  onChangeContent,
  onChangeTitle, // 添加 onChangeTitle
  noteViewRef,
  textColor,
  editorBackgroundColor,
  editorBorderColor,
  maxLength, // 添加 maxLength
  titleError, // 添加 titleError
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <View style={styles.contentContainer}>
      {/* 隐藏的导出视图 - 仅用于导出图片 */}
      <View 
        ref={noteViewRef} 
        collapsable={false} 
        style={[
          styles.printableContent, 
          { position: 'absolute', opacity: 0, width: 1, left: -9999, zIndex: -1 }
        ]}
      >        <View style={[styles.noteHeader, { backgroundColor: '#f8f8f8' }]}>
          <Text style={[styles.noteTitle, { color: '#000', fontSize: 20, fontWeight: 'bold' }]}>
            {title || String(t('untitledNote'))}
          </Text>
          <Text style={[styles.noteDate, { color: '#666', marginTop: 4 }]}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <Text style={{ color: '#000', fontSize: 16, lineHeight: 24 }}>
            {content || String(t('noContent'))}
          </Text>
        </View>
      </View>
      
      {/* 标题输入 */}
      <TextInput
        style={[
          {
            // 自定义标题输入样式
            backgroundColor: editorBackgroundColor || (colorScheme === 'dark' ? '#2c2c2c' : '#f5f5f5'), // 与内容编辑器背景色一致或略作区分
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            borderColor: titleError ? 'red' : (editorBorderColor || (colorScheme === 'dark' ? '#404040' : '#ddd')),
            borderWidth: 1,
            borderRadius: 5, // 轻微圆角
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 20, 
            fontWeight: 'bold',
            marginBottom: 10, // 与下方内容编辑器的间距
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

      {/* 实际编辑框 */}      <ScrollView style={styles.scrollView}>
        <TextInput
          style={[
            styles.input, 
            styles.contentInput, 
            { 
              backgroundColor: editorBackgroundColor || (colorScheme === 'dark' ? '#333' : '#f5f5f5'),
              color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
              borderColor: editorBorderColor || (colorScheme === 'dark' ? '#444' : '#ddd')
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
