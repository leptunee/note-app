import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, useColorScheme, Image, Animated, Alert } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback } from 'react';
import { extractFirstImageUri } from './utils/imageUtils';

export default function NotesScreen() {
  const { notes, refreshNotes, deleteNote } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  // 选择模式状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [toolbarAnimation] = useState(new Animated.Value(0));
  
  // 仅在页面首次获得焦点或从编辑页面返回时刷新笔记列表
  useFocusEffect(
    useCallback(() => {
      refreshNotes();
    }, [refreshNotes])
  );
  // 截断长内容，只显示前若干个字符
  const truncateContent = (text: string, maxLength: number = 80) => {
    // 先移除HTML标签，获取纯文本内容
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  // 进入选择模式
  const enterSelectionMode = (noteId: string) => {
    setIsSelectionMode(true);
    setSelectedNotes(new Set([noteId]));
    // 显示工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // 退出选择模式
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNotes(new Set());
    // 隐藏工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  // 切换笔记选择状态
  const toggleNoteSelection = (noteId: string) => {
    const newSelectedNotes = new Set(selectedNotes);
    if (newSelectedNotes.has(noteId)) {
      newSelectedNotes.delete(noteId);
    } else {
      newSelectedNotes.add(noteId);
    }
    setSelectedNotes(newSelectedNotes);
    
    // 如果没有选中的笔记，退出选择模式
    if (newSelectedNotes.size === 0) {
      exitSelectionMode();
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set());
      exitSelectionMode();
    } else {
      setSelectedNotes(new Set(notes.map(note => note.id)));
    }
  };

  // 删除选中的笔记
  const deleteSelectedNotes = () => {
    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedNotes.size} 条笔记吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            for (const noteId of selectedNotes) {
              await deleteNote(noteId);
            }
            exitSelectionMode();
          },
        },
      ]
    );
  };

  // 置顶选中的笔记 (暂时占位，后续可实现)
  const pinSelectedNotes = () => {
    Alert.alert('功能开发中', '置顶功能正在开发中');
  };

  // 导出选中的笔记 (暂时占位，后续可实现)
  const exportSelectedNotes = () => {
    Alert.alert('功能开发中', '批量导出功能正在开发中');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => router.push('/about')}
        >
          <FontAwesome 
            name="info-circle" 
            size={24} 
            color={colorScheme === 'dark' ? '#fff' : '#000'} 
          />
        </TouchableOpacity>        <Text style={[styles.header, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{String(t('notes'))}</Text>
        <TouchableOpacity
          style={[styles.addIconButton, { backgroundColor: Colors[colorScheme].tint }]}
          onPress={() => router.push('/note-edit')}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const firstImageUri = extractFirstImageUri(item.content);
          const isSelected = selectedNotes.has(item.id);
          
          return (
            <TouchableOpacity 
              style={[styles.noteItem, { 
                backgroundColor: colorScheme === 'dark' ? '#222' : '#f9f9f9',
                borderLeftColor: Colors[colorScheme].tint 
              }]} 
              onPress={() => {
                if (isSelectionMode) {
                  toggleNoteSelection(item.id);
                } else {
                  router.push({ pathname: '/note-edit', params: { id: item.id } });
                }
              }}
              onLongPress={() => enterSelectionMode(item.id)}
            >
              <View style={styles.noteContentContainer}>
                {isSelectionMode && (
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                      onPress={() => toggleNoteSelection(item.id)}
                    >
                      {isSelected && (
                        <FontAwesome name="check" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                
                <View style={[styles.noteTextContainer, isSelectionMode && styles.noteTextContainerWithCheckbox]}>
                  <Text 
                    style={[styles.noteTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                  <Text 
                    style={[styles.noteContent, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]} 
                    numberOfLines={firstImageUri ? 1 : 2}
                  >
                    {truncateContent(item.content, firstImageUri ? 40 : 60)}
                  </Text>
                  <Text style={[styles.noteDate, { color: colorScheme === 'dark' ? '#888' : '#999' }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                {firstImageUri && (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: firstImageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );        }}
      />

      {/* 选择模式工具栏 */}
      {isSelectionMode && (
        <Animated.View 
          style={[
            styles.toolbar,
            {
              transform: [{ translateY: toolbarAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              })}],
              backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f8f8',
            }
          ]}
        >
          <TouchableOpacity style={styles.toolbarButton} onPress={toggleSelectAll}>
            <FontAwesome 
              name={selectedNotes.size === notes.length ? "check-square" : "square-o"} 
              size={20} 
              color={Colors[colorScheme].tint} 
            />
            <Text style={[styles.toolbarButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
              全选
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={deleteSelectedNotes}>
            <FontAwesome name="trash" size={20} color="#ff3b30" />
            <Text style={[styles.toolbarButtonText, { color: '#ff3b30' }]}>
              删除
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={pinSelectedNotes}>
            <FontAwesome name="thumb-tack" size={20} color={Colors[colorScheme].tint} />
            <Text style={[styles.toolbarButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
              置顶
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={exportSelectedNotes}>
            <FontAwesome name="share" size={20} color={Colors[colorScheme].tint} />
            <Text style={[styles.toolbarButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
              导出
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },  aboutButton: {
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
  noteItem: {
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
  noteContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },  noteTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  noteTextContainerWithCheckbox: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },  imagePreview: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  toolbarButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
});

