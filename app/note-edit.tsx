import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text, TextInput, StatusBar } from 'react-native';
import { useEditorBridge, TenTapStarterKit, useBridgeState } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, ExportView, CategorySelector, CategoryModal, type ToastRef } from './components';
import { useEditorContent } from './components/hooks/useEditorContent';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);
  const titleInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const {
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
    selectedCategoryId,
    categories,
    isNewNote,
    noteViewRef,
    lastEditedTime,
    // 分类管理相关
    categoryModalVisible,
    setCategoryModalVisible,
    editingCategory,
    handleSave,
    handleBack,
    handleDelete,
    handleExport,
    handleTogglePin,
    getCurrentNotePinStatus,
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
  } = useNoteEdit(themes, toastRef, titleInputRef);

  // 创建编辑器实例
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: false,
    initialContent: content || '',
    bridgeExtensions: TenTapStarterKit,
  });

  // 使用TenTap的原生undo/redo方法
  const handleUndo = useCallback(() => {
    if (editor && typeof editor.undo === 'function') {
      editor.undo();
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (editor && typeof editor.redo === 'function') {
      editor.redo();
    }
  }, [editor]);

  // 使用useBridgeState监听编辑器状态
  const editorState = useBridgeState(editor);

  // 监听编辑器状态变化，更新undo/redo状态
  useEffect(() => {
    if (editor && editorState) {
      const newCanUndo = editorState.canUndo || false;
      const newCanRedo = editorState.canRedo || false;
      
      setCanUndo(newCanUndo);
      setCanRedo(newCanRedo);
    }
  }, [editor, editorState, setCanUndo, setCanRedo]);

  // 检查编辑器是否准备就绪
  useEffect(() => {
    if (!editor) return;
    
    let timeoutId: any;
    let checkCount = 0;
    const maxChecks = 30;
    
    const checkEditorReady = () => {
      if (editor && typeof editor.getHTML === 'function') {
        try {
          editor.getHTML();
          setIsEditorReady(true);
          return;
        } catch (error) {
          // 编辑器还未准备就绪
        }
      }
      
      checkCount++;
      if (checkCount < maxChecks) {
        timeoutId = setTimeout(checkEditorReady, 100);
      } else {
        setIsEditorReady(true); // 强制设为准备就绪，避免永久加载
      }
    };

    checkEditorReady();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editor]);
  
  // 使用 useEditorContent hook 管理内容同步
  useEditorContent({
    editor,
    initialContent: content,
    onContentChange: handleContentChange,
    debounceMs: 500
  });

  // 在保存前同步编辑器内容的函数
  const handleSaveWithSync = async () => {
    // 先让编辑器失去焦点
    try {
      if (editor && typeof editor.blur === 'function') {
        editor.blur();
      }
    } catch (error) {
      // 静默处理错误
    }
    
    // 立即调用键盘下落
    Keyboard.dismiss();
    
    // 获取编辑器内容并保存
    let latestContent: string | undefined;
    if (editor && typeof editor.getHTML === 'function') {
      try {
        latestContent = await editor.getHTML();
      } catch (error) {
        // 静默处理错误
      }
    }
    
    // 延迟执行保存，确保键盘已经下落
    setTimeout(() => {
      handleSave(latestContent, true);
      
      // 保存后再次确保编辑器失焦和键盘下落
      setTimeout(() => {
        try {
          if (editor && typeof editor.blur === 'function') {
            editor.blur();
          }
        } catch (error) {
          // 静默处理错误
        }
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
  }, []);

  // 使用 useMemo 缓存计算的样式值
  const contentPadding = useMemo(() => {
    return getContentPadding(pageSettings.marginValue);
  }, [pageSettings.marginValue]);

  const backgroundStyles = useMemo(() => ({
    opacity: pageSettings.backgroundImageOpacity,
  }), [pageSettings.backgroundImageOpacity]);

  const containerBackgroundColor = useMemo(() => {
    return getBackgroundColor(pageSettings, colorScheme);
  }, [pageSettings, colorScheme]);

  const textColor = useMemo(() => {
    return getTextColor(pageSettings, colorScheme);
  }, [pageSettings, colorScheme]);

  const editorBackgroundColor = useMemo(() => {
    return getEditorBackgroundColor(pageSettings, colorScheme);
  }, [pageSettings, colorScheme]);

  const editorBorderColor = useMemo(() => {
    return getEditorBorderColor(pageSettings, colorScheme);
  }, [pageSettings, colorScheme]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={containerBackgroundColor}
        translucent={false}
      />
      
      {/* 导出视图 - 独立渲染，不受任何容器约束 */}
      <ExportView
        ref={noteViewRef}
        title={title}
        content={content}
        lastEditedAt={lastEditedTime}
      />

      <View style={[
        styles.container,
        { backgroundColor: containerBackgroundColor }
      ]}>

        {pageSettings.backgroundImageUri && (
          <ImageBackground
            source={{ uri: pageSettings.backgroundImageUri }}
            style={[
              styles.backgroundImage,
              backgroundStyles
            ]}
            resizeMode="cover"
            blurRadius={pageSettings.backgroundImageBlur || 0}
          />
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header 不受页边距影响 */}
          <NoteHeader
            isNewNote={isNewNote}
            onBack={handleBack}
            onSave={handleSaveWithSync}
            onExport={handleExport}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
            isPinned={getCurrentNotePinStatus()}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            showOptionsMenu={showOptionsMenu}
            toggleOptionsMenu={() => setShowOptionsMenu(!showOptionsMenu)}
            onPageSettings={handleOpenPageSettings}
          />

          {/* 内容区域受页边距影响 */}
          <View style={{ 
            flex: 1, 
            paddingHorizontal: contentPadding,
            paddingTop: 0,
            paddingBottom: 0
          }}>
            
            {editor && isEditorReady ? (
              <RichTextContent
                title={title}
                content={content}
                onChangeContent={handleContentChange}
                onChangeTitle={handleTitleChange}
                noteViewRef={noteViewRef}
                textColor={textColor}
                editorBackgroundColor={editorBackgroundColor}
                editorBorderColor={editorBorderColor}
                maxLength={MAX_TITLE_LENGTH}
                titleError={titleError}
                editor={editor}
                titleInputRef={titleInputRef}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={handleCategoryChange}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
              />
            ) : (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200
              }}>
                <Text style={{ 
                  color: textColor, 
                  fontSize: 16,
                  opacity: 0.6 
                }}>
                  正在加载编辑器...
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* 工具栏 - 只在键盘弹起时显示，并固定在键盘上方 */}
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
        )}

        <ExportModal
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

        {/* 分类管理模态框 */}
        <CategoryModal
          isVisible={categoryModalVisible}
          category={editingCategory}
          onClose={() => setCategoryModalVisible(false)}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />

        <Toast ref={toastRef} />
      </View>
    </View>
  );
}