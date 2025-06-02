import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { useNotes, PageSettings } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
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
  const [content, setContent] = useState('');
  
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
        setContent(note.content);
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
      setContent('');
      setPageSettings({
        themeId: 'default',
        marginValue: 20,
        backgroundImageOpacity: 0.5, // 默认透明度设为50%
        backgroundImageBlur: 0, // 默认无模糊
        // 移除了默认背景图片
      });
    }
  }, [id, notes, t]);

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
    const saveSuccess = handleSave(currentContentOverride, false); // 静默保存
    // 无论保存是否成功，都返回（对于空内容的情况）
    if (saveSuccess !== false) {
      router.back();
    }
  };

  // 仅返回功能，不保存
  const handleBack = () => {
    router.back();
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
    toastRef?.current?.show('正在导出文本文件...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
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
    toastRef?.current?.show('正在导出Markdown文件...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
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
    // 显示loading toast
    toastRef?.current?.show('正在导出图片...', 'loading');
    
    try {
      // 检查 ref 是否可用
      if (!noteViewRef.current) {
        const message = '无法获取笔记视图以截图。';
        toastRef?.current?.hide();
        toastRef?.current?.show(message, 'error');
        return { success: false, message };
      }
      
      const now = Date.now();
      const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
      
      // 直接调用导出功能，不需要显式显示ExportView
      const result = await exportAsImage(noteViewRef, note);
      
      // 隐藏loading toast并显示结果
      toastRef?.current?.hide();
      toastRef?.current?.show(result.message, result.success ? 'success' : 'error');
      return result;
    } catch (error) {
      // 出现错误时隐藏loading toast并显示错误信息
      toastRef?.current?.hide();
      toastRef?.current?.show('导出图片时发生错误', 'error');
      return { success: false, message: '导出图片时发生错误' };
    }
  };
  const handleExportAsWord = async () => {
    toastRef?.current?.show('正在导出Word文档...', 'loading');
    
    try {
      const now = Date.now();
      const note = notes.find(n => n.id === id) || { id: 'temp', title, content, createdAt: now, updatedAt: now, pageSettings };
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

  // 清理定时器
  useEffect(() => {
    return () => {
      // 清理函数，目前为空
    };
  }, []);

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
    // 更新最后编辑时间
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
    isNewNote,
    noteViewRef,
    lastEditedTime,
    handleSave,
    handleSaveAndBack,
    handleBack,
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
    setCanUndo,
    setCanRedo,
  };
}
