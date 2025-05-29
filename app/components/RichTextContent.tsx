import React from 'react';
import { View, Text, TextInput, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';


interface RichTextContentProps {
  title: string;
  content: string;
  onChangeContent: (html: string) => void;
  onChangeTitle: (text: string) => void;
  noteViewRef: React.RefObject<any>;
  textColor?: string;
  editorBackgroundColor?: string;
  editorBorderColor?: string;
  maxLength?: number;
  titleError?: string;
  lastEditedAt?: number;
  editor: any; // 添加 editor prop
}

export const RichTextContent: React.FC<RichTextContentProps> = ({
  title,
  content,
  onChangeContent,
  onChangeTitle,
  noteViewRef,
  textColor,
  maxLength,
  titleError,
  lastEditedAt,
  editor, // 接收 editor 作为 prop
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
  // 获取纯文本内容用于字数统计
  const getPlainTextLength = (html: string) => {
    // 简单的HTML标签移除，实际项目中可能需要更完善的处理
    return html.replace(/<[^>]*>/g, '').length;
  };  // 监听内容变化并保存 - 使用定时器但增加检查  // 监听内容变化并保存 - 完全避免频繁更新
  const [isUpdating, setIsUpdating] = React.useState(false);
    React.useEffect(() => {
    // 减少延迟以更快响应内容变化
    const timeoutId = setTimeout(async () => {
      if (!isUpdating && editor && typeof editor.getHTML === 'function') {
        try {
          const currentHTML = await editor.getHTML();
          if (currentHTML !== content) {
            setIsUpdating(true);
            onChangeContent(currentHTML);
            // 设置一个短暂的冷却期
            setTimeout(() => setIsUpdating(false), 500);
          }        } catch (error) {
          // Editor not ready yet, skip this update
        }
      }
    }, 1000); // 减少到1秒延迟，更快响应变化

    return () => clearTimeout(timeoutId);
  }, [editor, content, onChangeContent, isUpdating]);

  // 只在初始化时设置内容，避免后续更新
  React.useEffect(() => {
    if (content !== undefined && editor && typeof editor.setContent === 'function' && !isUpdating) {
      // 只在编辑器没有焦点且不是正在更新时才设置内容
      const isFocused = typeof editor.isFocused === 'function' ? editor.isFocused() : false;
      if (!isFocused) {
        try {
          const currentHTML = editor.getHTML?.();
          // 只有内容真的不同且差异较大时才更新
          if (currentHTML !== content && Math.abs(currentHTML?.length - content.length) > 5) {
            editor.setContent(content);
          }        } catch (error) {
          // Failed to set editor content, skip
        }
      }
    }
  }, [content, editor, isUpdating]);
  
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
            {content ? content.replace(/<[^>]*>/g, '') : String(t('noContent'))}
          </Text>
        </View>      </View>

      {/* 标题输入区域 */}
      <TextInput
        style={[
          {
            backgroundColor: 'transparent',
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            paddingHorizontal: 0,
            paddingVertical: 4,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 2,
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        scrollEnabled={false}
      />
        {/* 日期和字数统计 */}      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 0, 
        marginBottom: 2
      }}>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {getPlainTextLength(content)} {getPlainTextLength(content) > 0 ? String(t('characters')) : String(t('character'))}
        </Text>
      </View>
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}      {/* 富文本编辑器 */}      <KeyboardAwareScrollView 
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        extraScrollHeight={ 40 }
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        keyboardOpeningTime={250}
        enableResetScrollToCoords={false}
      ><View style={{ 
          flex: 1,
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
          paddingTop: 0, // 移除顶部间距
          paddingBottom: 0,
        }}>
          <RichText 
            editor={editor}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              margin: 0,
              flex: 1,
              minHeight: 200,
            }}
            containerStyle={{
              backgroundColor: 'transparent',
              padding: 0,
              flex: 1,
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
