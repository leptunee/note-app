import React from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
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
}

export const RichTextContent: React.FC<RichTextContentProps> = ({
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

  // 获取纯文本内容用于字数统计
  const getPlainTextLength = (html: string) => {
    // 简单的HTML标签移除，实际项目中可能需要更完善的处理
    return html.replace(/<[^>]*>/g, '').length;
  };  // 创建编辑器桥接
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: true,
    initialContent: content || '',
  });  // 监听内容变化并保存
  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const currentHTML = await editor.getHTML();
        if (currentHTML !== content) {
          onChangeContent(currentHTML);
        }
      } catch (error) {
        // 编辑器可能还没有准备好，静默忽略错误
      }
    }, 500); // 每500毫秒检查一次内容变化，比之前更频繁

    return () => clearInterval(intervalId);
  }, [editor, content, onChangeContent]);

  // 当外部内容变化时更新编辑器
  React.useEffect(() => {
    if (content !== undefined) {
      editor.setContent(content);
    }
  }, [content, editor]);
  
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
        </View>
      </View>      <KeyboardAwareScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* 标题输入区域 */}
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
          scrollEnabled={false}
        />
        
        {/* 日期和字数统计 */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          paddingHorizontal: 12, 
          marginBottom: 16 
        }}>
          <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
            {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
          </Text>
          <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
            {getPlainTextLength(content)} {getPlainTextLength(content) > 0 ? String(t('characters')) : String(t('character'))}
          </Text>
        </View>
        
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}        {/* 富文本编辑器 */}
        <View style={{ 
          flex: 1,
          backgroundColor: 'transparent',
          padding: 12,
          minHeight: 300,
        }}>          <RichText 
            editor={editor}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              margin: 0,
            }}
            containerStyle={{
              backgroundColor: 'transparent',
              padding: 0,
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* 工具栏 */}
      <View style={{
        backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
      }}>
        <Toolbar 
          editor={editor}
        />
      </View>
    </View>
  );
};
