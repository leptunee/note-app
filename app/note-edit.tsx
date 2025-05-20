import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, updateNote, deleteNote } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  
  // 当页面加载时，如果有id，则查找对应的笔记
  useEffect(() => {
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    }
  }, [id, notes]);
  
  // 保存笔记并返回主界面
  const handleSave = () => {
    if (!title.trim()) return;
    
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        updateNote({
          ...note,
          title,
          content,
        });
      }
    }
    
    router.back();
  };
  
  // 删除笔记并返回主界面
  const handleDelete = () => {
    if (id) {
      deleteNote(id);
    }
    router.back();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{t('edit')}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
          color: colorScheme === 'dark' ? '#fff' : '#000',
          borderColor: colorScheme === 'dark' ? '#444' : '#ddd'
        }]}
        placeholder={t('title')}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />
      
      <ScrollView style={styles.scrollView}>
        <TextInput
          style={[styles.input, styles.contentInput, { 
            backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
            color: colorScheme === 'dark' ? '#fff' : '#000',
            borderColor: colorScheme === 'dark' ? '#444' : '#ddd'
          }]}
          placeholder={t('content')}
          value={content}
          onChangeText={setContent}
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
          multiline
        />
      </ScrollView>
      
      {id && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>{t('delete')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60, // 增加顶部间距，为状态栏留出空间
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  contentInput: {
    minHeight: 300,
    textAlignVertical: 'top',
  },
  scrollView: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
