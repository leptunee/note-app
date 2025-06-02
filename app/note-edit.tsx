import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text } from 'react-native';
import { useEditorBridge, TenTapStarterKit } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, type ToastRef } from './components';
import { useEditorContent } from './components/hooks/useEditorContent';
import { useEditorDebug } from './components/hooks/useEditorDebug';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);  const {
    title,
    content,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,
    titleError,
    showExportModal,
    setShowExportModal,
    showOptionsMenu,
    setShowOptionsMenu,
    showPageSettings,
    setShowPageSettings,
    pageSettings,
    isNewNote,
    noteViewRef,
    lastEditedTime,
    handleSave,
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
  } = useNoteEdit(themes, toastRef);
  // 创建编辑器实例 - 使用实际的 content 作为初始内容
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: false,
    initialContent: content || '', // 使用实际的 content 状态
    bridgeExtensions: TenTapStarterKit,
  });

  // 撤销/重做处理函数
  const handleUndo = useCallback(() => {
    if (editor && editor.undo) {
      console.log('执行撤销操作');
      editor.undo();
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (editor && editor.redo) {
      console.log('执行重做操作');
      editor.redo();
    }
  }, [editor]);  // 监听编辑器的撤销/重做状态变化
  useEffect(() => {
    if (!editor || !isEditorReady) return;

    const updateUndoRedoState = (eventName?: string) => {
      try {
        const newCanUndo = editor.canUndo || false;
        const newCanRedo = editor.canRedo || false;
        
        console.log(`撤销/重做状态更新 (${eventName || '手动'}):`, { 
          newCanUndo, 
          newCanRedo,
          timestamp: new Date().toISOString()
        });
        
        setCanUndo(newCanUndo);
        setCanRedo(newCanRedo);
      } catch (error) {
        console.warn('更新撤销/重做状态时出错:', error);
      }
    };

    // 立即检查一次状态
    updateUndoRedoState('初始化');

    // 尝试使用 TenTap 的状态订阅机制
    let unsubscribe: (() => void) | null = null;
    
    if (editor._subscribeToEditorStateUpdate && typeof editor._subscribeToEditorStateUpdate === 'function') {
      try {
        console.log('使用 TenTap 的 _subscribeToEditorStateUpdate 方法');
        unsubscribe = editor._subscribeToEditorStateUpdate(() => {
          updateUndoRedoState('_subscribeToEditorStateUpdate');        });
        console.log('已注册 TenTap 状态订阅器');
      } catch (error) {
        console.warn('注册 TenTap 状态订阅器失败:', error);
      }
    }
      // 如果 TenTap 订阅不可用，使用定时器作为后备方案
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (!unsubscribe) {
      console.log('使用定时器作为状态监听后备方案');
      intervalId = setInterval(() => updateUndoRedoState('定时器'), 1000);
    }

    return () => {
      if (unsubscribe) {
        console.log('清理 TenTap 状态订阅器');
        unsubscribe();
      }
      if (intervalId) {
        console.log('清理定时器');
        clearInterval(intervalId);
      }
    };
  }, [editor, isEditorReady, setCanUndo, setCanRedo]);
  // 使用 useEditorContent hook 管理内容同步
  useEditorContent({
    editor,
    initialContent: content,
    onContentChange: handleContentChange,
    debounceMs: 500
  });  // 添加编辑器调试信息
  useEditorDebug(editor);

  // 检查编辑器是否准备就绪
  useEffect(() => {
    const checkEditorReady = () => {
      if (editor && typeof editor.getHTML === 'function') {
        setIsEditorReady(true);
      } else {
        const timeoutId = setTimeout(checkEditorReady, 100);
        return () => clearTimeout(timeoutId);
      }
    };

    return checkEditorReady();
  }, [editor]);
  // 在保存前同步编辑器内容的函数
  const handleSaveWithSync = async () => {
    if (editor && typeof editor.getHTML === 'function') {
      try {
        const latestContent = await editor.getHTML();
        handleSave(latestContent);
      } catch (error) {
        handleSave();
      }
    } else {
      handleSave();
    }
  };

  // 键盘显示/隐藏监听
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={[
        styles.container,
        { backgroundColor: getBackgroundColor(pageSettings, colorScheme) }
      ]}>
        {pageSettings.backgroundImageUri && (
          <ImageBackground
            source={{ uri: pageSettings.backgroundImageUri }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View style={{ opacity: pageSettings.backgroundImageOpacity }} />
          </ImageBackground>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={{ flex: 1, paddingHorizontal: 16 }}>            <NoteHeader
              isNewNote={isNewNote}
              onBack={handleBack}
              onSave={handleSaveWithSync}
              onExport={handleExport}
              onDelete={handleDelete}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              showOptionsMenu={showOptionsMenu}
              toggleOptionsMenu={() => setShowOptionsMenu(!showOptionsMenu)}
              onPageSettings={handleOpenPageSettings}
            />{editor && isEditorReady && (
              <RichTextContent
                title={title}
                content={content}
                onChangeContent={handleContentChange}
                onChangeTitle={handleTitleChange}
                noteViewRef={noteViewRef}
                textColor={getTextColor(pageSettings, colorScheme)}
                editorBackgroundColor={getEditorBackgroundColor(pageSettings, colorScheme)}
                editorBorderColor={getEditorBorderColor(pageSettings, colorScheme)}
                maxLength={MAX_TITLE_LENGTH}
                titleError={titleError}
                lastEditedAt={lastEditedTime}
                editor={editor}
              />
            )}
          </View>
        </KeyboardAvoidingView>        {/* 工具栏 - 只在键盘弹起时显示，并固定在键盘上方 */}
        {editor && isEditorReady && isKeyboardVisible && (
          <View style={{
            position: 'absolute',
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}>
            <CustomToolbar
              editor={editor}
              isVisible={isKeyboardVisible}
            />
          </View>
        )}<ExportModal
          isVisible={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExportAsTxt={handleExportAsTxt}
          onExportAsMarkdown={handleExportAsMarkdown}
          onExportAsImage={handleExportAsImage}
          onExportAsWord={handleExportAsWord}
        />

        <PageSettingsModal
          isVisible={showPageSettings}
          onClose={() => setShowPageSettings(false)}
          currentSettings={pageSettings}
          onSettingsChange={handlePageSettingsChange}
        />

        <Toast ref={toastRef} />
      </View>
    </View>
  );
}
