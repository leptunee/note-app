import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useColorScheme, Keyboard, TextInput } from 'react-native';
import { useNotes, PageSettings, Category } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { type ToastRef } from './components';

export function useNoteEdit(themes: any[], toastRef?: React.RefObject<ToastRef | null>, titleInputRef?: React.RefObject<TextInput | null>) {
  const { id: routeId } = useLocalSearchParams<{ id: string }>();
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(routeId);
  const { notes, categories, addNote, updateNote, deleteNote, togglePinNote, updateNoteCategory, addCategory, updateCategory, deleteCategory } = useNotes();
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

  // 分类管理相关状态
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [lastEditedTime, setLastEditedTime] = useState<number | undefined>(undefined);
  
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    themeId: 'default',
    marginValue: 22,
    backgroundImageOpacity: 0.5,
    backgroundImageBlur: 0,
  });
  const colorScheme = useColorScheme() ?? 'light';
  const MAX_TITLE_LENGTH = 64;
  
  // 使用 useMemo 缓存计算值
  const isNewNote = useMemo(() => !currentNoteId, [currentNoteId]);
  const noteViewRef = useRef(null);

  // 使用 useMemo 缓存默认页面设置
  const defaultPageSettingsForNote = useMemo((): PageSettings => ({
    themeId: 'default',
    marginValue: 22,
    backgroundImageOpacity: 0.5,
    backgroundImageBlur: 0,
  }), []);
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
          setPageSettings(defaultPageSettingsForNote);
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
      setPageSettings(defaultPageSettingsForNote);
    }
  }, [currentNoteId, notes, t, defaultPageSettingsForNote, MAX_TITLE_LENGTH]);
  // 使用 useCallback 优化保存功能
  const handleSave = useCallback((currentContentOverride?: string, showToast: boolean = true) => {
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
  }, [content, title, t, MAX_TITLE_LENGTH, selectedCategoryId, pageSettings, currentNoteId, notes, updateNote, addNote, toastRef]);

  // 使用 useCallback 优化保存并返回功能 - 静默保存，不显示 toast
  const handleSaveAndBack = useCallback((currentContentOverride?: string) => {
    const saveSuccess = handleSave(currentContentOverride, false);
    if (saveSuccess !== false) {
      router.back();
    }
  }, [handleSave, router]);

  // 使用 useCallback 优化仅返回功能，不保存
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  
  const handleDelete = useCallback(() => {
    if (currentNoteId) {
      deleteNote(currentNoteId);
    }
    router.back();
  }, [currentNoteId, deleteNote, router]);

  const handleExport = useCallback(() => {
    setShowOptionsMenu(false);
    setShowExportModal(true);
  }, []);

  // 使用 useCallback 优化处理置顶功能
  const handleTogglePin = useCallback(async () => {
    if (currentNoteId) {
      await togglePinNote(currentNoteId);
      setShowOptionsMenu(false);
      toastRef?.current?.show('已更新置顶状态', 'success');
    }
  }, [currentNoteId, togglePinNote, toastRef]);

  // 使用 useCallback 优化获取当前笔记的置顶状态
  const getCurrentNotePinStatus = useCallback(() => {
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      return note?.pinned || false;
    }
    return false;
  }, [currentNoteId, notes]);

    // 使用 useMemo 缓存当前笔记数据，避免重复创建
  const currentOrTempNote = useMemo(() => {
    const now = Date.now();
    return notes.find(n => n.id === currentNoteId) || { 
      id: 'temp', 
      title, 
      content, 
      createdAt: now, 
      updatedAt: now, 
      pageSettings 
    };
  }, [notes, currentNoteId, title, content, pageSettings]);

  const handleExportAsTxt = useCallback(async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出文本文件...', 'loading');
    
    try {
      const result = await exportAsTxt(currentOrTempNote);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出文本文件时发生错误', 'error');
      return { success: false, message: '导出文本文件时发生错误' };
    }
  }, [titleInputRef, toastRef, exportAsTxt, currentOrTempNote]);

  const handleExportAsMarkdown = useCallback(async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出Markdown文件...', 'loading');
    
    try {
      const result = await exportAsMarkdown(currentOrTempNote);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出Markdown文件时发生错误', 'error');
      return { success: false, message: '导出Markdown文件时发生错误' };
    }
  }, [titleInputRef, toastRef, exportAsMarkdown, currentOrTempNote]);

  const handleExportAsImage = useCallback(async () => {
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
      
      const result = await exportAsImage(noteViewRef, currentOrTempNote);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出图片时发生错误', 'error');
      return { success: false, message: '导出图片时发生错误' };
    }
  }, [titleInputRef, toastRef, noteViewRef, exportAsImage, currentOrTempNote]);

  const handleExportAsWord = useCallback(async () => {
    if (titleInputRef?.current) {
      titleInputRef.current.blur();
    }
    
    Keyboard.dismiss();
    toastRef?.current?.show('正在导出Word文档...', 'loading');
    
    try {
      const result = await exportAsWord(currentOrTempNote);
      
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      toastRef?.current?.hide();
      toastRef?.current?.show('导出Word文档时发生错误', 'error');
      return { success: false, message: '导出Word文档时发生错误' };
    }
  }, [titleInputRef, toastRef, exportAsWord, currentOrTempNote]);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    setLastEditedTime(Date.now());
    if (text.length > MAX_TITLE_LENGTH) {
      setTitleError(String(t('titleTooLong', { max: MAX_TITLE_LENGTH })));
    } else {
      setTitleError('');
    }
  }, [MAX_TITLE_LENGTH, t]);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    setLastEditedTime(Date.now());
  }, []);

  const handleOpenPageSettings = useCallback(() => {
    setShowPageSettings(true);
  }, []);

  const handlePageSettingsChange = useCallback((settings: Partial<PageSettings>) => {
    setPageSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // 使用 useCallback 优化处理分类选择
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  // 使用 useCallback 优化添加分类
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryModalVisible(true);
  }, []);

  // 使用 useCallback 优化编辑分类
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  }, []);

  // 使用 useCallback 优化保存分类
  const handleSaveCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCategory) {
      // 编辑现有分类
      const updatedCategory: Category = {
        ...editingCategory,
        ...categoryData,
        updatedAt: Date.now(),
      };
      await updateCategory(updatedCategory);
    } else {
      // 添加新分类
      const newCategory: Category = {
        id: uuidv4(),
        ...categoryData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addCategory(newCategory);
    }
  }, [editingCategory, updateCategory, addCategory]);

  // 使用 useCallback 优化删除分类
  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    await deleteCategory(categoryId);
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('all');
    }
  }, [deleteCategory, selectedCategoryId]);return {
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
    // 分类管理相关
    categoryModalVisible,
    setCategoryModalVisible,
    editingCategory,
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
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleDeleteCategory,
    MAX_TITLE_LENGTH,
    colorScheme,
    setCanUndo,
    setCanRedo,
    getCurrentNotePinStatus,
  };
}
