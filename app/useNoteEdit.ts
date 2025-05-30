import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { useNotes, PageSettings } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useHistory } from '@/components/useHistory';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { type ToastRef } from './components'; // Import ToastRef type from components

export function useNoteEdit(themes: any[], toastRef?: React.RefObject<ToastRef | null>) { // toastRef type now matches what note-edit.tsx provides
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { exportAsTxt, exportAsMarkdown, exportAsImage, exportAsWord } = useExport();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const {
    value: content, // This is the reactive content state from useHistory
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
  const [lastEditedTime, setLastEditedTime] = useState<number | undefined>(undefined);
  const [autoSaveTimer, setAutoSaveTimer] = useState<any>(null);
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    themeId: 'default',
    marginValue: 20,
    backgroundImageOpacity: 0.5, // 默认透明度设为50%
    backgroundImageBlur: 0, // 默认无模糊
    // 移除了默认背景图片
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
        setLastEditedTime(note.updatedAt);
        if (note.pageSettings) {
          setPageSettings(note.pageSettings);
        } else {
          setPageSettings({
            themeId: 'default',
            marginValue: 20,
            backgroundImageOpacity: 0.5, // 默认透明度设为50%
            backgroundImageBlur: 0, // 默认无模糊
            // 移除了默认背景图片
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
        backgroundImageOpacity: 0.5, // 默认透明度设为50%
        backgroundImageBlur: 0, // 默认无模糊
        // 移除了默认背景图片
      });
    }
  }, [id, notes, t, resetContentHistory]);
  const handleSave = (currentContentOverride?: string) => {
    const contentToUse = typeof currentContentOverride === 'string' ? currentContentOverride : content;
    const finalTitle = title.trim() || String(t('untitledNote'));
    
    if (finalTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
      return;
    }

    if (!finalTitle.trim() && !contentToUse.trim()) {
      router.back();
      return;
    }
      const noteData = {
      title: finalTitle,
      content: contentToUse,
      pageSettings,
    };
    
    try {
      if (id) {
        const note = notes.find(n => n.id === id);
        if (note) {
          updateNote({
            ...note,
            ...noteData,
            updatedAt: Date.now(),
          });
        }
      } else {
        const now = Date.now();
        const newNoteId = uuidv4();
        const newNote = {
          id: newNoteId,
          ...noteData,
          createdAt: now,
          updatedAt: now,
        };
        addNote(newNote);
      }      
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        setAutoSaveTimer(null);
      }
      
      router.back();
    } catch (error) {
      toastRef?.current?.show('保存失败，请重试', 'error');
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteNote(id);
    }
    router.back();
  };

  const handleExport = () => {
    setShowOptionsMenu(false);
    setShowExportModal(true);
  };

  // Modify export functions to use toastRef and return ExportResult
  const handleExportAsTxt = async () => {
    const now = Date.now();
    const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
    const result = await exportAsTxt(note);
    toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
    return result;
  };

  const handleExportAsMarkdown = async () => {
    const now = Date.now();
    const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
    const result = await exportAsMarkdown(note);
    toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
    return result;
  };

  const handleExportAsImage = async () => {
    if (!noteViewRef.current) {
      const message = '无法获取笔记视图以截图。';
      toastRef?.current?.show(message, 'error');
      return { success: false, message };
    }
    const now = Date.now();
    const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
    const result = await exportAsImage(noteViewRef, note);
    toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
    return result;
  };

  const handleExportAsWord = async () => {
    const now = Date.now();
    const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
    const result = await exportAsWord(note);
    toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
    return result;
  };

  // 自动保存功能 - 在内容变化后延迟保存
  const triggerAutoSave = () => {
    // 清除之前的定时器
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // 设置新的定时器，3秒后自动保存
    const timer = setTimeout(() => {
      if (title.trim() || content.trim()) {
        console.log('Auto-saving note...');
        handleSave();
      }
    }, 3000);
    
    setAutoSaveTimer(timer);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  useEffect(() => {
    if (showOptionsMenu) {
      const timer = setTimeout(() => {
        setShowOptionsMenu(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showOptionsMenu]);  const handleTitleChange = (text: string) => {
    setTitle(text);
    // 更新最后编辑时间
    setLastEditedTime(Date.now());
    if (text.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
    } else {
      setTitleError('');
    }
    // 触发自动保存
    triggerAutoSave();
  };
  const handleContentChange = (text: string) => {
    updateContent(text); // Updates the 'content' state from useHistory
    setLastEditedTime(Date.now());
    triggerAutoSave();
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
    lastEditedTime,  // 添加最后编辑时间
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
