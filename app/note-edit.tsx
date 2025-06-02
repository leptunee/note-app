import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text, TextInput } from 'react-native';
import { useEditorBridge, TenTapStarterKit } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, ExportView, type ToastRef } from './components';
import { useEditorContent } from './components/hooks/useEditorContent';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);
  const titleInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);  const {
    title,
    content,
    canUndo,
    canRedo,
    setCanUndo,
    setCanRedo,    titleError,
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
  } = useNoteEdit(themes, toastRef, titleInputRef);
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
      editor.undo();
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (editor && editor.redo) {
      editor.redo();
    }
  }, [editor]);// 监听编辑器的撤销/重做状态变化
  useEffect(() => {
    if (!editor || !isEditorReady) return;    const updateUndoRedoState = (eventName?: string) => {
      try {
        const newCanUndo = editor.canUndo || false;
        const newCanRedo = editor.canRedo || false;
        
        setCanUndo(newCanUndo);
        setCanRedo(newCanRedo);
      } catch (error) {
        // 静默处理错误
      }
    };    // 立即检查一次状态
    updateUndoRedoState();

    // 尝试使用 TenTap 的状态订阅机制
    let unsubscribe: (() => void) | null = null;
    
    if (editor._subscribeToEditorStateUpdate && typeof editor._subscribeToEditorStateUpdate === 'function') {
      try {
        unsubscribe = editor._subscribeToEditorStateUpdate(() => {
          updateUndoRedoState();
        });
      } catch (error) {
        // 静默处理错误
      }
    }      // 如果 TenTap 订阅不可用，使用定时器作为后备方案
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (!unsubscribe) {
      intervalId = setInterval(() => updateUndoRedoState(), 1000);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [editor, isEditorReady, setCanUndo, setCanRedo]);
  // 使用 useEditorContent hook 管理内容同步
  useEditorContent({
    editor,
    initialContent: content,
    onContentChange: handleContentChange,
    debounceMs: 500  });

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
  }, [editor]);  // 在保存前同步编辑器内容的函数
  const handleSaveWithSync = async () => {
    console.log('🚀 handleSaveWithSync called - 开始保存操作');
    
    // 先让编辑器失去焦点
    try {
      if (editor && typeof editor.blur === 'function') {
        console.log('📝 Calling editor.blur() - 编辑器失焦');
        editor.blur();
      }
    } catch (error) {
      console.log('⚠️ Editor blur failed:', error);
    }
    
    // 立即调用键盘下落
    console.log('📱 Calling Keyboard.dismiss() immediately - 立即键盘下落');
    Keyboard.dismiss();
    
    // 获取编辑器内容并保存
    let latestContent: string | undefined;
    if (editor && typeof editor.getHTML === 'function') {
      try {
        latestContent = await editor.getHTML();
        console.log('✅ Editor content retrieved');
      } catch (error) {
        console.log('⚠️ Failed to get editor content:', error);
      }
    } else {
      console.log('⚠️ Editor not available');
    }
      // 延迟执行保存，确保键盘已经下落
    setTimeout(() => {
      console.log('💾 Executing delayed save operation');
      handleSave(latestContent, true); // 显示toast，用户点击保存按钮应该有反馈
      
      // 保存后再次确保编辑器失焦和键盘下落
      setTimeout(() => {
        try {
          if (editor && typeof editor.blur === 'function') {
            console.log('📝 Post-save editor.blur() - 保存后编辑器失焦');
            editor.blur();
          }
        } catch (error) {
          console.log('⚠️ Post-save editor blur failed:', error);
        }
        console.log('📱 Post-save Keyboard.dismiss() - 保存后键盘下落');
        Keyboard.dismiss();
      }, 100);
    }, 200);
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
  }, []);  return (
    <View style={{ flex: 1 }}>
      {/* 导出视图 - 独立渲染，不受任何容器约束 */}
      <ExportView
        ref={noteViewRef}
        title={title}
        content={content}
        lastEditedAt={lastEditedTime}
      />
      
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
            />            {editor && isEditorReady && (              <RichTextContent
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
                titleInputRef={titleInputRef}
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
