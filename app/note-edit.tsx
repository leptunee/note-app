import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, useColorScheme, Alert, Modal } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { v4 as uuidv4 } from 'uuid';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { exportAsTxt, exportAsMarkdown, exportAsImage, exportAsWord } = useExport();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64; // 最大标题长度限制为64个汉字
  const isNewNote = !id;
  const noteViewRef = useRef(null);
  const optionsMenuRef = useRef(null);
  
  // 当页面加载时，如果有id，则查找对应的笔记
  useEffect(() => {
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        // 检查加载的标题是否超过限制
        if (note.title.length > MAX_TITLE_LENGTH) {
          setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
        }
      }
    }
  }, [id, notes, t]);
  
  // 保存笔记并返回主界面
  const handleSave = () => {
    if (!title.trim()) return;
    
    // 验证标题长度
    if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
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
  
  // 处理导出功能
  const handleExport = () => {
    // 如果是新笔记且未保存，则不允许导出
    if (isNewNote || !title.trim()) {
      Alert.alert('提示', '请先保存笔记后再导出');
      return;
    }
    
    setShowExportModal(true);
  };
  
  // 获取当前笔记对象
  const getCurrentNote = () => {
    return id 
      ? notes.find(n => n.id === id) 
      : { id: 'temp', title, content, createdAt: Date.now() };
  };
  
  // 导出为纯文本
  const handleExportAsTxt = async () => {
    setShowExportModal(false);
    
    const currentNote = getCurrentNote();
    if (!currentNote) {
      Alert.alert('错误', '未找到笔记');
      return;
    }
    
    const success = await exportAsTxt(currentNote);
    if (success) {
      Alert.alert('成功', '笔记已导出为文本文件');
    } else {
      Alert.alert('错误', '导出笔记时出错');
    }
  };
  
  // 导出为 Markdown
  const handleExportAsMarkdown = async () => {
    setShowExportModal(false);
    
    const currentNote = getCurrentNote();
    if (!currentNote) {
      Alert.alert('错误', '未找到笔记');
      return;
    }
    
    const success = await exportAsMarkdown(currentNote);
    if (success) {
      Alert.alert('成功', '笔记已导出为 Markdown 文件');
    } else {
      Alert.alert('错误', '导出笔记时出错');
    }
  };
  
  // 导出为图片
  const handleExportAsImage = async () => {
    setShowExportModal(false);
    
    const currentNote = getCurrentNote();
    if (!currentNote) {
      Alert.alert('错误', '未找到笔记');
      return;
    }
    
    // 确保noteViewRef已正确绑定
    if (!noteViewRef || !noteViewRef.current) {
      Alert.alert('错误', '无法获取笔记视图');
      return;
    }
    
    // 显示提示
    Alert.alert('提示', '将把整个笔记内容截图导出', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            const success = await exportAsImage(noteViewRef, currentNote);
            if (!success) {
              Alert.alert('错误', '导出笔记时出错');
            }
          } catch (error) {
            console.error('截图过程出错:', error);
            Alert.alert('错误', '截图过程出错，请重试');
          }
        }
      }
    ]);
  };
  
  // 导出为Word文档
  const handleExportAsWord = async () => {
    setShowExportModal(false);
    
    const currentNote = getCurrentNote();
    if (!currentNote) {
      Alert.alert('错误', '未找到笔记');
      return;
    }
    
    const success = await exportAsWord(currentNote);
    if (success) {
      Alert.alert('成功', '笔记已导出为Word兼容文档');
    } else {
      Alert.alert('错误', '导出笔记时出错');
    }
  };
  
  // 点击屏幕其他区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (showOptionsMenu) {
        setShowOptionsMenu(false);
      }
    };
    
    // 添加事件监听 - 模拟点击外部关闭
    setTimeout(() => {
      if (showOptionsMenu) {
        const timer = setTimeout(() => {
          setShowOptionsMenu(false);
        }, 4000); // 4秒后自动关闭
        return () => clearTimeout(timer);
      }
    }, 100);
    
    return () => {
      // 清理
    };
  }, [showOptionsMenu]);
  
  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>{String(t('back'))}</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {isNewNote ? String(t('add')) : String(t('edit'))}
        </Text>
        
        <View style={styles.headerActions}>
          {!isNewNote && (
            <View style={styles.optionsMenuContainer}>
              <TouchableOpacity 
                style={styles.optionsButton} 
                onPress={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                <FontAwesome name="ellipsis-v" size={18} color={Colors[colorScheme].tint} />
              </TouchableOpacity>
              
              {/* 下拉菜单 */}
              {showOptionsMenu && (
                <View style={[styles.optionsMenu, { 
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#444' : '#eaeaea'
                }]}>
                  <TouchableOpacity 
                    style={styles.optionItem} 
                    onPress={() => {
                      setShowOptionsMenu(false);
                      handleExport();
                    }}
                  >
                    <FontAwesome name="download" size={18} color={colorScheme === 'dark' ? '#fff' : '#000'} style={styles.optionIcon} />
                    <Text style={[styles.optionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>导出笔记</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.optionItem} 
                    onPress={() => {
                      setShowOptionsMenu(false);
                      Alert.alert(
                        String(t('deleteConfirmTitle')),
                        String(t('deleteConfirmMessage')),
                        [
                          { text: String(t('cancel')), style: 'cancel' },
                          { text: String(t('delete')), onPress: handleDelete, style: 'destructive' }
                        ]
                      );
                    }}
                  >
                    <FontAwesome name="trash-o" size={18} color="#ff3b30" style={styles.optionIcon} />
                    <Text style={[styles.optionText, { color: '#ff3b30' }]}>删除笔记</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity onPress={handleSave} style={{marginLeft: 15}}>
            <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>{String(t('save'))}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
          color: colorScheme === 'dark' ? '#fff' : '#000',
          borderColor: titleError ? '#ff3b30' : colorScheme === 'dark' ? '#444' : '#ddd'
        }]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (text.length > MAX_TITLE_LENGTH) {
            setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
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
      
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          <View ref={noteViewRef} collapsable={false} style={styles.printableContent}>
            <View style={[styles.noteHeader, { backgroundColor: colorScheme === 'dark' ? '#222' : '#f8f8f8' }]}>
              <Text style={[styles.noteTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{title || String(t('untitledNote'))}</Text>
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
              onChangeText={setContent}
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
              multiline
            />
          </View>
        </ScrollView>
      </View>
      
      {/* 导出选项模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExportModal}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>选择导出格式</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowExportModal(false)}
              >
                <FontAwesome name="times" size={22} color={colorScheme === 'dark' ? '#ccc' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportAsTxt}>
              <FontAwesome name="file-text-o" size={24} color={Colors[colorScheme].tint} />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>文本文件 (.txt)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportAsWord}>
              <FontAwesome name="file-word-o" size={24} color="#2B579A" />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Word文档 (.html)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportAsMarkdown}>
              <FontAwesome name="file-code-o" size={24} color="#663399" />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Markdown (.md)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportAsImage}>
              <FontAwesome name="file-image-o" size={24} color="#4CAF50" />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>图片 (.png)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }]} 
              onPress={() => setShowExportModal(false)}
            >
              <FontAwesome name="times-circle" size={16} color={colorScheme === 'dark' ? '#ccc' : '#666'} style={{marginRight: 6}} />
              <Text style={[styles.closeButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
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
  contentContainer: {
    flex: 1,
    width: '100%',
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
  },
  // 导出模态框样式
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginBottom: 16,
    paddingBottom: 12,
  },
  modalCloseBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginVertical: 4,
  },
  exportOptionText: {
    fontSize: 17,
    marginLeft: 15,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16
  },
  // 导出按钮样式
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint, // 使用应用主题色
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  // 用于截图的容器样式
  printableContent: {
    width: '100%',
    minHeight: 400,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  noteHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  // 选项菜单样式
  optionsMenuContainer: {
    position: 'relative',
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
  },
  optionsMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 160,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  optionIcon: {
    width: 22,
    marginRight: 12,
    textAlign: 'center'
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  }
});
