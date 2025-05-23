import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

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
  lastEditedAt?: number;
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
  lastEditedAt,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  // 获取格式化的日期
  const getFormattedDate = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };
  
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
      >
        <View style={[styles.noteHeader, { backgroundColor: '#f8f8f8' }]}>
          <Text style={[styles.noteTitle, { color: '#000', fontSize: 24, fontWeight: 'bold' }]}>
            {title || String(t('untitledNote'))}
          </Text>
          <Text style={[styles.noteDate, { color: '#666', marginTop: 4 }]}>
            {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
          </Text>
        </View>
        
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <Text style={{ color: '#000', fontSize: 16, lineHeight: 24 }}>
            {content || String(t('noContent'))}
          </Text>
        </View>
      </View>
      {/* 使用KeyboardAwareScrollView替代ScrollView */}
      <KeyboardAwareScrollView 
        contentContainerStyle={{  flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={200}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
      >
      {/* 标题输入 - 无边框样式 */}
      <TextInput
        style={[
          {
            backgroundColor: 'transparent',
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 0,
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />
      
      {/* 日期和字数统计 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 16 }}>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {content.length} {content.length > 0 ? String(t('characters')) : String(t('character'))}
        </Text>
      </View>
      
      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        <TextInput
          style={[
            styles.contentInput, 
            { 
              backgroundColor: 'transparent',
              color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
              padding: 12,
              borderWidth: 0,
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
      </KeyboardAwareScrollView>
    </View>
  );
};
