import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { useNotes, PageSettings } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useHistory } from '@/components/useHistory';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

export function useNoteEdit(themes: any[]) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { exportAsTxt, exportAsMarkdown, exportAsImage, exportAsWord } = useExport();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
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
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    themeId: 'default',
    marginValue: 20,
    backgroundImageOpacity: 1,
  });
  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64;
  const isNewNote = !id;
  const noteViewRef = useRef(null);

  useEffect(() => {
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        resetContentHistory(note.content);
        if (note.pageSettings) {
          setPageSettings(note.pageSettings);
        } else {
          setPageSettings({
            themeId: 'default',
            marginValue: 20,
            backgroundImageOpacity: 1,
          });
        }
        if (note.title.length > MAX_TITLE_LENGTH) {
          setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
        }
      }
    } else {
      resetContentHistory('');
      setPageSettings({
        themeId: 'default',
        marginValue: 20,
        backgroundImageOpacity: 1,
      });
    }
  }, [id, notes, t, resetContentHistory]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (title.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
      return;
    }
    const noteData = {
      title,
      content,
      pageSettings,
    };
    if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        updateNote({
          ...note,
          ...noteData,
        });
      }
    } else {
      addNote({
        id: uuidv4(),
        ...noteData,
        createdAt: Date.now(),
      });
    }
    router.back();
  };

  const handleDelete = () => {
    if (id) {
      deleteNote(id);
    }
    router.back();
  };

  const handleExport = () => {
    if (isNewNote || !title.trim()) {
      Alert.alert('提示', '请先保存笔记后再导出');
      return;
    }
    setShowExportModal(true);
  };

  const getCurrentNote = () => {
    return id
      ? notes.find(n => n.id === id)
      : { id: 'temp', title, content, createdAt: Date.now(), pageSettings };
  };

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

  const handleExportAsImage = async () => {
    setShowExportModal(false);
    const currentNote = getCurrentNote();
    if (!currentNote) {
      Alert.alert('错误', '未找到笔记');
      return;
    }
    if (!noteViewRef || !noteViewRef.current) {
      Alert.alert('错误', '无法获取笔记视图');
      return;
    }
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

  useEffect(() => {
    if (showOptionsMenu) {
      const timer = setTimeout(() => {
        setShowOptionsMenu(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showOptionsMenu]);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
    } else {
      setTitleError('');
    }
  };

  const handleContentChange = (text: string) => {
    updateContent(text);
  };

  const handleOpenPageSettings = () => {
    setShowPageSettings(true);
  };

  const handlePageSettingsChange = (settings: Partial<PageSettings>) => {
    setPageSettings(prev => ({ ...prev, ...settings }));
  };

  return {
    title,
    setTitle,
    content,
    updateContent,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    titleError,
    setTitleError,
    showExportModal,
    setShowExportModal,
    showOptionsMenu,
    setShowOptionsMenu,
    showPageSettings,
    setShowPageSettings,
    pageSettings,
    setPageSettings,
    isNewNote,
    noteViewRef,
    handleSave,
    handleDelete,
    handleExport,
    handleExportAsTxt,
    handleExportAsMarkdown,
    handleExportAsImage,
    handleExportAsWord,
    handleTitleChange,
    handleContentChange,
    handleOpenPageSettings,
    handlePageSettingsChange,
    MAX_TITLE_LENGTH,
    colorScheme,
  };
}
