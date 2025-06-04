import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme, Keyboard, TextInput } from 'react-native';
import { useNotes, PageSettings } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { type ToastRef } from './components';

export function useNoteEdit(themes: any[], toastRef?: React.RefObject<ToastRef | null>, titleInputRef?: React.RefObject<TextInput | null>) {
  const { id: routeId } = useLocalSearchParams<{ id: string }>();
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(routeId);
  const { notes, categories, addNote, updateNote, deleteNote, togglePinNote, updateNoteCategory } = useNotes();
  const { exportAsTxt, exportAsMarkdown, exportAsImage, exportAsWord } = useExport();
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  
  // 编辑器的 undo/redo 状态将在 note-edit.tsx 中管理
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [titleError, setTitleError] = useState('');

  const [showExportModal, setShowExportModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);

  const [lastEditedTime, setLastEditedTime] = useState<number | undefined>(undefined);
  
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    themeId: 'default',
    marginValue: 22,
    backgroundImageOpacity: 0.5,
    backgroundImageBlur: 0,
  });

  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64;
  const isNewNote = !currentNoteId;
  const noteViewRef = useRef(null);

  useEffect(() => {
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      if (note) {        // 直接设置内容，移除复杂的 setTimeout 逻辑
        setTitle(note.title);
        setContent(note.content);
        setSelectedCategoryId(note.categoryId || 'all');
        setLastEditedTime(note.updatedAt);
        
        if (note.pageSettings) {
          setPageSettings(note.pageSettings);        
        } else {
          setPageSettings({
            themeId: 'default',
            marginValue: 22,
            backgroundImageOpacity: 0.5,
            backgroundImageBlur: 0,
          });
        }
        
        if (note.title.length > MAX_TITLE_LENGTH) {
          setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
        } else {
          setTitleError('');
        }
      }    } else {        // 新笔记的处理
      setTitle('');
      setContent('');
      setSelectedCategoryId('uncategorized');
      setPageSettings({
        themeId: 'default',
        marginValue: 22,
        backgroundImageOpacity: 0.5,
        backgroundImageBlur: 0,
      });
    }
  }, [currentNoteId, notes, t]);

  // 纯保存功能，可选择是否显示 toast
  const handleSave = (currentContentOverride?: string, showToast: boolean = true) => {
    const contentToUse = typeof currentContentOverride === 'string' ? currentContentOverride : content;
    const finalTitle = title.trim() || String(t('untitledNote'));
    
    if (finalTitle.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
      return false;
    }

    // 如果标题和内容都为空，不保存
    if (!finalTitle.trim() && !contentToUse.trim()) {
      return false;
    }        const noteData = {
      title: finalTitle,
      content: contentToUse,
      categoryId: selectedCategoryId === 'all' ? 'uncategorized' : selectedCategoryId,
      pageSettings,
    };
    
    try {
      if (currentNoteId) {
        const note = notes.find(n => n.id === currentNoteId);
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
        setCurrentNoteId(newNoteId);
      }
      
      if (showToast) {
        toastRef?.current?.show('保存成功', 'success');
      }
      return true;
    } catch (error) {
      if (showToast) {
        toastRef?.current?.show('保存失败，请重试', 'error');
      }
      return false;
    }
  };

  // 保存并返回功能 - 静默保存，不显示 toast
  const handleSaveAndBack = (currentContentOverride?: string) => {
    const saveSuccess = handleSave(currentContentOverride, false);
    if (saveSuccess !== false) {
      router.back();
    }
  };

  // 仅返回功能，不保存
  const handleBack = () => {
    router.back();
  };
  
  const handleDelete = () => {
    if (currentNoteId) {
      deleteNote(currentNoteId);
    }
    router.back();
  };

  const handleExport = () => {
    setShowOptionsMenu(false);
    setShowExportModal(true);
  };

  // 处理置顶功能
  const handleTogglePin = async () => {
    if (currentNoteId) {
      await togglePinNote(currentNoteId);
      setShowOptionsMenu(false);
      toastRef?.current?.show('已更新置顶状态', 'success');
    }
  };

  // 获取当前笔记的置顶状态
  const getCurrentNotePinStatus = () => {
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      return note?.pinned || false;
    }
    return false;
  };

  const handleExportAsTxt = async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出文本文件...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === currentNoteId) || { 
        id: 'temp', 
        title, 
        content, 
        createdAt: now, 
        updatedAt: now, 
        pageSettings 
      };
      const result = await exportAsTxt(note);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出文本文件时发生错误', 'error');
      return { success: false, message: '导出文本文件时发生错误' };
    }
  };

  const handleExportAsMarkdown = async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出Markdown文件...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === currentNoteId) || { 
        id: 'temp', 
        title, 
        content, 
        createdAt: now, 
        updatedAt: now, 
        pageSettings 
      };
      const result = await exportAsMarkdown(note);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出Markdown文件时发生错误', 'error');
      return { success: false, message: '导出Markdown文件时发生错误' };
    }
  };

  const handleExportAsImage = async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出图片...', 'loading');
    
    try {
      if (!noteViewRef.current) {
        const message = '无法获取笔记视图以截图。';
        toastRef?.current?.hide();
        toastRef?.current?.show(message, 'error');
        return { success: false, message };
      }
      
      const now = Date.now();
      const note = notes.find(n => n.id === currentNoteId) || { 
        id: 'temp', 
        title, 
        content, 
        createdAt: now, 
        updatedAt: now, 
        pageSettings 
      };
      
      const result = await exportAsImage(noteViewRef, note);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出图片时发生错误', 'error');
      return { success: false, message: '导出图片时发生错误' };
    }
  };

  const handleExportAsWord = async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出Word文档...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === currentNoteId) || { 
        id: 'temp', 
        title, 
        content, 
        createdAt: now, 
        updatedAt: now, 
        pageSettings 
      };
      const result = await exportAsWord(note);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出Word文档时发生错误', 'error');
      return { success: false, message: '导出Word文档时发生错误' };
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
    setLastEditedTime(Date.now());
    if (text.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
    } else {
      setTitleError('');
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setLastEditedTime(Date.now());
  };

  const handleOpenPageSettings = () => {
    setShowPageSettings(true);
  };
    const handlePageSettingsChange = (settings: Partial<PageSettings>) => {
    setPageSettings(prev => ({ ...prev, ...settings }));
  };

  // 处理分类选择
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };
  return {
    title,
    setTitle,
    content,
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
    selectedCategoryId,
    categories,
    isNewNote,
    noteViewRef,
    lastEditedTime,
    currentNoteId,
    handleSave,
    handleSaveAndBack,
    handleBack,
    handleDelete,
    handleExport,
    handleTogglePin,
    handleExportAsTxt,
    handleExportAsMarkdown,
    handleExportAsImage,
    handleExportAsWord,
    handleTitleChange,
    handleContentChange,
    handleOpenPageSettings,
    handlePageSettingsChange,
    handleCategoryChange,
    MAX_TITLE_LENGTH,
    colorScheme,
    setCanUndo,
    setCanRedo,
    getCurrentNotePinStatus,
  };
}
