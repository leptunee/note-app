import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useHistory } from '@/components/useHistory';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { 
  NoteHeader, 
  TitleInput,
  NoteContent,
  ExportModal,
  styles
} from './components';

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { exportAsTxt, exportAsMarkdown, exportAsImage, exportAsWord } = useExport();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  // 使用自定义Hook管理内容及历史记录
  const { 
    value: content, 
    setValue: updateContent, 
    undo: handleUndo, 
    redo: handleRedo,
    reset: resetContentHistory,
    canUndo,
    canRedo
  } = useHistory<string>('');
  const [titleError, setTitleError] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64; // 最大标题长度限制为64个汉字
  const isNewNote = !id;
  const noteViewRef = useRef(null);
  // 当页面加载时，如果有id，则查找对应的笔记
  useEffect(() => {
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        // 重置内容历史
        resetContentHistory(note.content);
        
        // 检查加载的标题是否超过限制
        if (note.title.length > MAX_TITLE_LENGTH) {
          setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
        }
      }
    } else {
      // 如果是新笔记，则初始化为空的历史记录
      resetContentHistory('');
    }
  }, [id, notes, t, resetContentHistory]);
  
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
    if (showOptionsMenu) {
      const timer = setTimeout(() => {
        setShowOptionsMenu(false);
      }, 4000); // 4秒后自动关闭
      return () => clearTimeout(timer);
    }
  }, [showOptionsMenu]);
    // 处理标题变化
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
    } else {
      setTitleError('');
    }
  };
    // 内容变化处理函数，使用useHistory Hook中的setValue
  const handleContentChange = (text: string) => {
    updateContent(text);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>      <NoteHeader 
        isNewNote={isNewNote}
        onBack={() => router.back()}
        onSave={handleSave}
        onExport={handleExport}
        onDelete={handleDelete}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        showOptionsMenu={showOptionsMenu}
        toggleOptionsMenu={() => setShowOptionsMenu(!showOptionsMenu)}
      />
      
      <TitleInput 
        title={title}
        titleError={titleError}
        maxLength={MAX_TITLE_LENGTH}
        onChangeTitle={handleTitleChange}
      />      <NoteContent 
        title={title}
        content={content}
        onChangeContent={handleContentChange}
        noteViewRef={noteViewRef}
      />
      
      <ExportModal 
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportAsTxt={handleExportAsTxt}
        onExportAsWord={handleExportAsWord}
        onExportAsMarkdown={handleExportAsMarkdown}
        onExportAsImage={handleExportAsImage}
      />
    </View>
  );
}
