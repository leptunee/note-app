import React from 'react';
import { View, ScrollView, Text, TextInput, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

interface NoteContentProps {
  title: string;
  content: string;
  onChangeContent: (text: string) => void;
  noteViewRef: React.RefObject<any>;
  textColor?: string; // 可选的文本颜色参数
  marginSize?: 'small' | 'medium' | 'large'; // 页边距大小
  editorBackgroundColor?: string; // 编辑器背景色
  editorBorderColor?: string; // 编辑器边框色
}

export const NoteContent: React.FC<NoteContentProps> = ({
  title,
  content,
  onChangeContent,
  noteViewRef,
  textColor,
  marginSize = 'medium', // 默认中等边距
  editorBackgroundColor,
  editorBorderColor
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

  const getInternalPadding = () => {
    switch (marginSize) {
      case 'small': return 8;
      case 'large': return 24;
      default: return 12; // 中等或默认 (styles.input的原始padding是12)
    }
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
      
      {/* 实际编辑框 */}      <ScrollView style={styles.scrollView}>
        <TextInput
          style={[
            styles.input, 
            styles.contentInput, 
            { 
              padding: getInternalPadding(), // 应用动态内边距
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
