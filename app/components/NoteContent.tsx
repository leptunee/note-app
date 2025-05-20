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
      <ScrollView style={styles.scrollView}>
        <View ref={noteViewRef} collapsable={false} style={styles.printableContent}>
          <View style={[styles.noteHeader, { backgroundColor: colorScheme === 'dark' ? '#222' : '#f8f8f8' }]}>
            <Text style={[styles.noteTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              {title || String(t('untitledNote'))}
            </Text>
            <Text style={[styles.noteDate, { color: colorScheme === 'dark' ? '#bbb' : '#666' }]}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          
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
        </View>
      </ScrollView>
    </View>
  );
};
