import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback } from 'react';

export default function NotesScreen() {
  const { notes, refreshNotes } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  // 仅在页面首次获得焦点或从编辑页面返回时刷新笔记列表
  useFocusEffect(
    useCallback(() => {
      // 使用一个标记变量，确保只在页面获得焦点时执行一次
      let isFocused = true;
      
      if (isFocused) {
        refreshNotes();
      }
      
      return () => {
        // 页面失去焦点时清理
        isFocused = false;
      };
    }, []) // 移除 refreshNotes 依赖，防止循环更新
  );
    // 截断长内容，只显示前若干个字符
  const truncateContent = (text: string, maxLength: number = 80) => {
    // 先移除HTML标签，获取纯文本内容
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => router.push('/about')}
        >
          <FontAwesome 
            name="info-circle" 
            size={24} 
            color={colorScheme === 'dark' ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{String(t('notes'))}</Text>
        <TouchableOpacity
          style={[styles.addIconButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={() => router.push('/note-edit')}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
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
            </Text>            <Text 
              style={[styles.noteContent, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]} 
              numberOfLines={1}
            >
              {truncateContent(item.content, 60)}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  aboutButton: {
    padding: 8,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },  noteItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
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
  },  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  }
});
