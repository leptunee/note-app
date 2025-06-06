import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text, TextInput, StatusBar, Alert, Dimensions } from 'react-native';
import { useEditorBridge, TenTapStarterKit, useBridgeState } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, ExportView, CategorySelector, CategoryModal, DrawingCanvas, type ToastRef } from './components';
import { useEditorContent } from './components/hooks/useEditorContent';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);  const titleInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);
  // 涂鸦功能相关状态
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);

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

  // 添加调试日志
  console.log('Toolbar visibility states:', {
    isKeyboardVisible,
    isEditorFocused,
    isEditorReady,
    shouldShowToolbar: (isKeyboardVisible || isEditorFocused) && isEditorReady && editor
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
  // 监听键盘显示状态来控制工具栏显示（更可靠的方式）
  useEffect(() => {
    // 当键盘显示时，假设编辑器获得了焦点
    if (isKeyboardVisible) {
      setIsEditorFocused(true);
    }
  }, [isKeyboardVisible]);

  // 监听编辑器焦点状态（用于控制工具栏显示）
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      console.log('Editor focused');
      setIsEditorFocused(true);
    };

    const handleBlur = () => {
      console.log('Editor blurred');
      // 延迟处理blur，避免在点击工具栏时立即隐藏
      setTimeout(() => {
        setIsEditorFocused(false);
      }, 100);
    };

    // 尝试添加焦点监听器
    try {
      if (typeof editor.on === 'function') {
        editor.on('focus', handleFocus);
        editor.on('blur', handleBlur);
      }
    } catch (error) {
      console.warn('Failed to add focus listeners:', error);
    }

    return () => {
      try {
        if (typeof editor.off === 'function') {
          editor.off('focus', handleFocus);
          editor.off('blur', handleBlur);
        }
      } catch (error) {
        console.warn('Failed to remove focus listeners:', error);
      }
    };
  }, [editor]);

  // 获取当前格式状态
  const formatStates = useMemo(() => {
    if (!editorState) {
      return {
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isBulletList: false,
        isOrderedList: false
      };
    }
    
    return {
      isBold: editorState.isBoldActive || false,
      isItalic: editorState.isItalicActive || false,
      isUnderline: editorState.isUnderlineActive || false,
      isBulletList: editorState.isBulletListActive || false,
      isOrderedList: editorState.isOrderedListActive || false
    };
  }, [editorState]);

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

  // 涂鸦画板相关处理函数
  const handleOpenDrawing = useCallback(() => {
    console.log('Opening drawing canvas...');
    setShowDrawingCanvas(true);
  }, []);

  const handleSaveDrawing = useCallback(async (imageData: string) => {
    console.log('Saving drawing with image data length:', imageData.length);
    if (!editor) {
      console.warn('Editor not available');
      setShowDrawingCanvas(false);
      return;
    }

    try {
      // 创建图片HTML，参考CustomToolbar中图片插入的成功实现
      const imageHtml = `<img src="${imageData}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px;" alt="涂鸦" title="涂鸦" />`;

      console.log('Attempting to insert drawing image HTML:', imageHtml.substring(0, 100) + '...');

      // 尝试插入涂鸦图片，参考图片插入的成功方法
      let insertSuccess = false;

      // 方法1: 使用直接的 insertContent（参考图片插入的成功方法）
      if (!insertSuccess) {
        try {
          console.log('Trying direct insertContent...');
          if (typeof editor.insertContent === 'function') {
            await editor.insertContent(imageHtml);
            insertSuccess = true;
            console.log('Direct insertContent succeeded');
          }
        } catch (e) {
          console.warn('Direct insertContent failed:', e);
        }
      }

      // 方法2: 使用 commands.insertContent
      if (!insertSuccess) {
        try {
          console.log('Trying commands.insertContent...');
          if (editor.commands && typeof editor.commands.insertContent === 'function') {
            await editor.commands.insertContent(imageHtml);
            insertSuccess = true;
            console.log('commands.insertContent succeeded');
          }
        } catch (e) {
          console.warn('commands.insertContent failed:', e);
        }
      }

      // 方法3: 使用 chain().insertContent()
      if (!insertSuccess) {
        try {
          console.log('Trying chain().insertContent()...');
          if (editor.chain && typeof editor.chain === 'function') {
            await editor.chain().focus().insertContent(imageHtml).run();
            insertSuccess = true;
            console.log('chain().insertContent() succeeded');
          }
        } catch (e) {
          console.warn('chain().insertContent() failed:', e);
        }
      }

      // 方法4: 使用 setContent 在当前内容后追加（作为备用方案）
      if (!insertSuccess) {
        try {
          console.log('Trying setContent append...');
          if (typeof editor.getHTML === 'function' && typeof editor.setContent === 'function') {
            const currentContent = await editor.getHTML();
            const newContent = currentContent + imageHtml;
            editor.setContent(newContent);
            insertSuccess = true;
            console.log('setContent append succeeded');
          }
        } catch (e) {
          console.warn('setContent append failed:', e);
        }
      }

      if (!insertSuccess) {
        console.warn('All drawing insertion methods failed');
        Alert.alert('插入失败', '无法将涂鸦插入到编辑器中，请检查编辑器状态');
      } else {
        console.log('Drawing inserted successfully');
        // 验证插入结果
        try {
          if (typeof editor.getHTML === 'function') {
            const resultContent = await editor.getHTML();
            console.log('Final content after drawing insertion:', resultContent.length, 'characters');
          }
        } catch (e) {
          console.warn('Failed to verify insertion:', e);
        }
      }

    } catch (error) {
      console.error('Failed to insert drawing:', error);
      Alert.alert('插入失败', '涂鸦插入失败，请重试');
    } finally {
      setShowDrawingCanvas(false);
    }
  }, [editor]);

  const handleCancelDrawing = useCallback(() => {
    setShowDrawingCanvas(false);
  }, []);

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
        </KeyboardAvoidingView>        {/* 自定义工具栏：基于键盘显示状态或编辑器焦点状态显示 */}
        {editor && isEditorReady && (isKeyboardVisible || isEditorFocused) && (
          <View style={{
            position: 'absolute',
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}>
            <CustomToolbar
              editor={editor}
              isVisible={isKeyboardVisible || isEditorFocused}
              isBold={formatStates.isBold}
              isItalic={formatStates.isItalic}
              isUnderline={formatStates.isUnderline}
              isBulletList={formatStates.isBulletList}
              isOrderedList={formatStates.isOrderedList}
              onOpenDrawing={handleOpenDrawing}
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
      </View>      {/* 涂鸦画板 - 独立于其他视图之上，始终显示在最上层 */}
      {showDrawingCanvas && (
        <DrawingCanvas
          width={Dimensions.get('window').width - 32}
          height={Dimensions.get('window').height * 0.6}
          visible={showDrawingCanvas}
          onCancel={handleCancelDrawing}
          onSave={handleSaveDrawing}
        />
      )}
    </View>
  );
}