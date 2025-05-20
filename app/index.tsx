import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function NotesScreen() {
  const { notes, addNote } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const colorScheme = useColorScheme() ?? 'light';

  const handleAdd = () => {
    if (!title.trim()) return;
    addNote({ id: uuidv4(), title, content, createdAt: Date.now() });
    setTitle('');
    setContent('');
  };
  
  // 截断长内容，只显示前若干个字符
  const truncateContent = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{t('notes')}</Text>
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
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>{t('add')}</Text>
      </TouchableOpacity>      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.noteItem, { 
              backgroundColor: colorScheme === 'dark' ? '#222' : '#f9f9f9',
              borderLeftColor: Colors[colorScheme].tint 
            }]} 
            onPress={() => router.push({ pathname: '/note-edit', params: { id: item.id } })}
          >
            <Text style={[styles.noteTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
              {item.title}
            </Text>
            <Text 
              style={[styles.noteContent, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]} 
              numberOfLines={2}
            >
              {truncateContent(item.content)}
            </Text>
            <Text style={[styles.noteDate, { color: colorScheme === 'dark' ? '#888' : '#999' }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    height: 110, // 固定高度
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  }
});
