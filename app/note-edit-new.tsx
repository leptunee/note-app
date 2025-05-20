import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { v4 as uuidv4 } from 'uuid';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64; // 最大标题长度限制为64个汉字
  const isNewNote = !id;
  
  // 当页面加载时，如果有id，则查找对应的笔记
  useEffect(() => {
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        // 检查加载的标题是否超过限制
        if (note.title.length > MAX_TITLE_LENGTH) {
          setTitleError(t('titleTooLong', { max: MAX_TITLE_LENGTH }));
        }
      }
    }
  }, [id, notes, t]);
  
  // 保存笔记并返回主界面
  const handleSave = () => {
    if (!title.trim()) return;
    
    // 验证标题长度
    if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(t('titleTooLong', { max: MAX_TITLE_LENGTH }));
      return;
    }
    
    if (id) {
      // 更新现有笔记
      const note = notes.find(n => n.id === id);
      if (note) {
        updateNote({
          ...note,
          title,
          content,
        });
      }
    } else {
      // 创建新笔记
      addNote({
        id: uuidv4(),
        title,
        content,
        createdAt: Date.now()
      });
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
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {isNewNote ? t('add') : t('edit')}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>{t('save')}</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
          color: colorScheme === 'dark' ? '#fff' : '#000',
          borderColor: titleError ? '#ff3b30' : colorScheme === 'dark' ? '#444' : '#ddd'
        }]}
        placeholder={t('title')}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (text.length > MAX_TITLE_LENGTH) {
            setTitleError(t('titleTooLong', { max: MAX_TITLE_LENGTH }));
          } else {
            setTitleError('');
          }
        }}
        maxLength={MAX_TITLE_LENGTH + 10} // 稍微给一点余量，以便显示错误
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />
      
      {titleError ? (
        <Text style={styles.errorText}>{titleError}</Text>
      ) : null}
      
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
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 4,
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
