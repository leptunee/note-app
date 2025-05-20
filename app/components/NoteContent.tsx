import React from 'react';
import { View, ScrollView, Text, TextInput, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

interface NoteContentProps {
  title: string;
  content: string;
  onChangeContent: (text: string) => void;
  noteViewRef: React.RefObject<any>;
}

export const NoteContent: React.FC<NoteContentProps> = ({
  title,
  content,
  onChangeContent,
  noteViewRef
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
      
      {/* 实际编辑框 */}
      <ScrollView style={styles.scrollView}>
        <TextInput
          style={[styles.input, styles.contentInput, { 
            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
            color: colorScheme === 'dark' ? '#fff' : '#000',
            borderColor: colorScheme === 'dark' ? '#444' : '#ddd'
          }]}
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
