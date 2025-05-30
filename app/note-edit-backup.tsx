import React, { useRef, useState, useEffect } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text } from 'react-native';
import { useEditorBridge, TenTapStarterKit } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, type ToastRef } from './components';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null); // Correctly typed toastRef
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  const {
    title,
    content,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    titleError,
    showExportModal,
    setShowExportModal,
    showOptionsMenu,
    setShowOptionsMenu,    showPageSettings,
    setShowPageSettings,
    pageSettings,
    isNewNote,
    noteViewRef,
    lastEditedTime,
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
    colorScheme,  } = useNoteEdit(themes, toastRef); // Pass toastRef to useNoteEdit
    // 创建编辑器实例
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: false,
    initialContent: content || '',
    bridgeExtensions: TenTapStarterKit,
  });

  // 等待编辑器准备就绪
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    // 检查编辑器是否准备就绪
    const checkEditorReady = () => {
      if (editor && typeof editor.getHTML === 'function') {
        setIsEditorReady(true);
      } else {
        setTimeout(checkEditorReady, 100); // 100ms后重试
      }
    };

    checkEditorReady();
  }, [editor]);

  // 简化的初始内容设置 - 只在编辑器首次准备好时执行一次
  useEffect(() => {
    if (!editor || !isEditorReady || !content) return;

    // 只在首次初始化时设置内容，之后由 useEditorContent hook 管理
    let hasInitialized = false;
    const initializeContent = async () => {
      if (hasInitialized) return;
      try {
        const currentHTML = editor.getHTML?.() || '';
        if (currentHTML === '' || currentHTML === '<p></p>') {
          console.log('Setting initial editor content on first load');
          editor.setContent(content);
          hasInitialized = true;
        }
      } catch (error) {
        console.log('Error setting initial content:', error);
      }
    };

    initializeContent();
  }, [editor, isEditorReady, content]);
  // 在保存前同步编辑器内容的函数
  const handleSaveWithSync = async () => {
    console.log('handleSaveWithSync called');
    
    if (editor && typeof editor.getHTML === 'function') {
      try {
        console.log('Getting latest content from editor for save');
        const latestContent = await editor.getHTML();
        console.log('Latest content from editor for save:', latestContent.substring(0, 100) + '...');
        
        // Call handleSave with the latest content from the editor
        handleSave(latestContent);

      } catch (error) {
        console.warn('Failed to sync editor content, saving with current state from useNoteEdit:', error);
        handleSave(); // Fallback to saving with content from useNoteEdit state
      }    } else {
      console.log('Editor not ready or no getHTML method, saving with current state from useNoteEdit');
      handleSave(); // Fallback to saving with content from useNoteEdit state
    }
  };
  // 键盘显示/隐藏监听
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
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
            style={[
              styles.backgroundImage,
              Platform.OS === 'web' && pageSettings.backgroundImageBlur ? 
                { filter: `blur(${pageSettings.backgroundImageBlur}px)` } : {}
            ]}
            imageStyle={{ 
              opacity: pageSettings.backgroundImageOpacity,
              ...(Platform.OS !== 'web' && pageSettings.backgroundImageBlur ? 
                  { filter: `blur(${pageSettings.backgroundImageBlur}px)` } : {})
            }}
            resizeMode="cover"
          />
        )}
          <NoteHeader
          isNewNote={isNewNote}
          onBack={handleSaveWithSync}
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
        />
          <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'height' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >          <View style={{ 
            flex: 1, 
            paddingLeft: getContentPadding(pageSettings.marginValue),
            paddingRight: getContentPadding(pageSettings.marginValue),
            paddingTop: 0,
            paddingBottom: 0, // 移除底部间距，让内容直接延伸到工具栏
          }}>
            <RichTextContent
              title={title}
              content={content}
              onChangeContent={handleContentChange}
              onChangeTitle={handleTitleChange}
              titleError={titleError}
              maxLength={MAX_TITLE_LENGTH}
              noteViewRef={noteViewRef}
              textColor={getTextColor(pageSettings, colorScheme)}
              editorBackgroundColor={getEditorBackgroundColor(pageSettings, colorScheme)}
              editorBorderColor={getEditorBorderColor(pageSettings, colorScheme)}
              lastEditedAt={lastEditedTime}
              editor={editor}
            />
          </View>        </KeyboardAvoidingView>

        {/* 工具栏 - 只在键盘显示时出现 */}        {isKeyboardVisible && keyboardHeight > 0 && (
          <View style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' 
              ? keyboardHeight - 34  // iOS: 键盘高度减去安全区域
              : keyboardHeight,      // Android: 直接使用键盘高度
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            zIndex: 1000,
            paddingHorizontal: 8,
            height: 52, // 减少工具栏高度
          }}>
            <CustomToolbar editor={editor} />
          </View>
        )}
        
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
        <Toast ref={toastRef} />
      </View>
    </View>
  );
}
