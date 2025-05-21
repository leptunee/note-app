import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, useColorScheme, Platform, ImageBackground } from 'react-native';
import { useNotes, PageSettings } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { useHistory } from '@/components/useHistory';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { 
  NoteHeader, 
  NoteContent,
  ExportModal,
  PageSettingsModal,
  styles
} from './components';

// 预定义的主题选项 - 与 PageSettingsModal.tsx 中的定义同步或后续提取到共享文件
// 增加了 editorBackgroundColor 和 editorBorderColor (可选)
const themes = [
  { id: 'default', name: '默认', backgroundColor: '#ffffff', textColor: '#000000', editorBackgroundColor: '#f5f5f5', editorBorderColor: '#ddd' },
  { id: 'dark', name: '暗黑', backgroundColor: '#121212', textColor: '#ffffff', editorBackgroundColor: '#2c2c2c', editorBorderColor: '#404040' },
  { id: 'sepia', name: '护眼', backgroundColor: '#f8f1e3', textColor: '#5b4636', editorBackgroundColor: '#f0e8da', editorBorderColor: '#d8c8b6' },
  { id: 'blue', name: '蓝色', backgroundColor: '#edf6ff', textColor: '#333333', editorBackgroundColor: '#e0f0ff', editorBorderColor: '#c0d8f0' },
];

export default function NoteEditScreen() {
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

  const getBackgroundColor = () => {
    if (pageSettings.backgroundImageUri) {
      return 'transparent';
    }

    const themeDefinition = themes.find(t => t.id === pageSettings.themeId) as typeof themes[0] | undefined;
    if (themeDefinition) {
      return themeDefinition.backgroundColor;
    }
    return colorScheme === 'dark' ? '#000' : '#fff';
  };

  const getTextColor = () => {
    const themeDefinition = themes.find(t => t.id === pageSettings.themeId) as typeof themes[0] | undefined;
    if (themeDefinition) {
      return themeDefinition.textColor;
    }
    return colorScheme === 'dark' ? '#fff' : '#000';
  };

  const getEditorBackgroundColor = () => {
    const themeDefinition = themes.find(t => t.id === pageSettings.themeId) as typeof themes[0] | undefined;
    if (themeDefinition) {
      return themeDefinition.editorBackgroundColor || themeDefinition.backgroundColor;
    }
    return colorScheme === 'dark' ? '#333' : '#f5f5f5';
  };

  const getEditorBorderColor = () => {
    const themeDefinition = themes.find(t => t.id === pageSettings.themeId) as typeof themes[0] | undefined;
    if (themeDefinition) {
      return themeDefinition.editorBorderColor || (colorScheme === 'dark' ? '#444' : '#ddd');
    }
    return colorScheme === 'dark' ? '#444' : '#ddd';
  };

  const getContentPadding = () => {
    const minPadding = 4;
    const maxPadding = 40;
    return minPadding + (pageSettings.marginValue / 100) * (maxPadding - minPadding);
  };

  return (
    <View style={[
      styles.container, 
      { backgroundColor: getBackgroundColor() }
    ]}>      
      {pageSettings.backgroundImageUri && (
        <ImageBackground
          source={{ uri: pageSettings.backgroundImageUri }}
          style={styles.backgroundImage}
          imageStyle={{ opacity: pageSettings.backgroundImageOpacity }}
          resizeMode="cover"
        />
      )}
      <NoteHeader 
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
        onPageSettings={handleOpenPageSettings}
      />
      
      <View style={{
        flex: 1,
        padding: getContentPadding(),
      }}>
        <NoteContent 
          title={title}
          content={content}
          onChangeContent={handleContentChange}
          onChangeTitle={handleTitleChange}
          titleError={titleError}
          maxLength={MAX_TITLE_LENGTH}
          noteViewRef={noteViewRef}
          textColor={getTextColor()}
          editorBackgroundColor={getEditorBackgroundColor()}
          editorBorderColor={getEditorBorderColor()}
        />
      </View>
      
      <ExportModal 
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportAsTxt={handleExportAsTxt}
        onExportAsWord={handleExportAsWord}
        onExportAsMarkdown={handleExportAsMarkdown}
        onExportAsImage={handleExportAsImage}
      />
      
      <PageSettingsModal
        isVisible={showPageSettings}
        onClose={() => setShowPageSettings(false)}
        currentSettings={pageSettings}
        onSettingsChange={handlePageSettingsChange}
      />
    </View>
  );
}
