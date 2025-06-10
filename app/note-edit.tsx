import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text, TextInput, StatusBar, Alert, Dimensions } from 'react-native';
import { useEditorBridge, TenTapStarterKit, useBridgeState } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, CustomToolbar, styles, Toast, ExportView, CategorySelector, DrawingCanvas, type ToastRef } from './components';
import { ExportModal, PageSettingsModal, CategoryModal } from './components/LazyComponents';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from '@/src/utils/noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);  const titleInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);  // 涂鸦功能相关状态
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);

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
    handlePageSettingsChange,    handleCategoryChange,
    handleAddCategory,
    handleEditCategory,
    handleSaveCategory,
    handleDeleteCategory,
    MAX_TITLE_LENGTH,
    colorScheme,
    t, // 添加翻译函数
  } = useNoteEdit(themes, toastRef, titleInputRef);// 简化状态管理
  const [forceShowEditor, setForceShowEditor] = useState(false);
  const contentSetRef = useRef<string>(''); // 跟踪已设置的内容
    useEffect(() => {
    // 如果3秒后编辑器还有问题，强制显示
    const forceTimer = setTimeout(() => {
      setForceShowEditor(true);
    }, 3000);
    
    return () => {
      clearTimeout(forceTimer);
    };
  }, []);// 创建编辑器实例 - 直接创建，使用空的初始内容
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: false,
    bridgeExtensions: TenTapStarterKit,
    editable: true,
    initialContent: '', // 使用空内容避免初始化问题
  });// 使用useBridgeState监听编辑器状态并获取isReady状态
  const editorState = useBridgeState(editor);
  const isReady = editorState?.isReady || false;


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
    if (!editor) return;    const handleFocus = () => {
      setIsEditorFocused(true);
    };

    const handleBlur = () => {
      // 延迟处理blur，避免在点击工具栏时立即隐藏
      setTimeout(() => {
        setIsEditorFocused(false);
      }, 100);
    };    // 尝试添加焦点监听器
    try {
      if (typeof editor.on === 'function') {
        editor.on('focus', handleFocus);
        editor.on('blur', handleBlur);
      }
    } catch (error) {
      // 静默处理错误
    }

    return () => {
      try {
        if (typeof editor.off === 'function') {
          editor.off('focus', handleFocus);
          editor.off('blur', handleBlur);
        }
      } catch (error) {
        // 静默处理错误
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
  }, [editorState]);  // 智能的编辑器内容设置 - 避免重复和闪烁，修复内容不显示问题
  useEffect(() => {
    if (!editor) {
      return;
    }

    // 检查是否需要设置内容
    const currentContentRef = contentSetRef.current;
    
    if (currentContentRef === content && isEditorReady) {
      // 内容没有变化且编辑器已准备好，不需要重新设置
      return;
    }
    
    const setContentSafely = async () => {
      try {
        // 等待编辑器完全准备好
        let retryCount = 0;
        const maxRetries = 3; // 减少重试次数
          while (retryCount < maxRetries) {
          try {
            // 尝试获取编辑器状态来确认它已准备好
            await editor.getHTML();
            break;
          } catch (error) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 100)); // 减少等待时间
          }
        }
          if (content && content.trim() !== '') {
          // 优先使用最简单可靠的方法
          try {
            await editor.setContent(content);
            contentSetRef.current = content;
          } catch (error) {
            // 静默处理错误
          }
        } else {
          // 清空编辑器
          try {
            await editor.setContent('');
            contentSetRef.current = '';
          } catch (error) {
            // 静默处理错误
          }
        }
          // 只在内容真的发生变化时才更新状态
        if (!isEditorReady) {
          setIsEditorReady(true);
        }
      } catch (error) {
        if (!isEditorReady) {
          setIsEditorReady(true);
        }
      }
    };
    
    setContentSafely();
  }, [editor, content]); // 移除 isEditorReady 依赖，避免循环  // 监听编辑器内容变化（优化版本 - 防止循环触发）
  useEffect(() => {
    if (!editor?.on || !isEditorReady) return;
    
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    
    const handleContentUpdate = () => {
      // 清除之前的定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // 使用防抖延迟处理内容变化
      debounceTimer = setTimeout(async () => {
        try {
          const currentHTML = await editor.getHTML();
          // 只有当内容真的发生变化时才更新
          if (currentHTML !== contentSetRef.current) {
            handleContentChange(currentHTML);
            contentSetRef.current = currentHTML; // 更新引用
          }
        } catch (error) {
          // 静默处理错误
        }
      }, 500);
    };

    // 监听编辑器的更新事件
    editor.on('update', handleContentUpdate);
    
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      editor.off?.('update', handleContentUpdate);
    };
  }, [editor, isEditorReady, handleContentChange]);

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
    setShowDrawingCanvas(true);
  }, []);
  const handleSaveDrawing = useCallback(async (imageData: string) => {
    if (!editor) {
      setShowDrawingCanvas(false);
      return;
    }try {      // 创建可删除的图片HTML结构
      // 使用简洁的图片标签，保持可通过键盘删除的功能
      const imageHtml = `<img src="${imageData}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px; object-fit: contain;" alt="${t('drawing')}" title="${t('drawing')}" data-type="image" data-source="drawing" />`;

      // 尝试插入涂鸦图片，参考图片插入的成功方法
      let insertSuccess = false;      // 方法1: 使用直接的 insertContent（参考图片插入的成功方法）
      if (!insertSuccess) {
        try {
          if (typeof editor.insertContent === 'function') {
            await editor.insertContent(imageHtml);
            insertSuccess = true;
          }
        } catch (e) {
          // 静默处理错误
        }
      }

      // 方法2: 使用 commands.insertContent
      if (!insertSuccess) {
        try {
          if (editor.commands && typeof editor.commands.insertContent === 'function') {
            await editor.commands.insertContent(imageHtml);
            insertSuccess = true;
          }
        } catch (e) {
          // 静默处理错误
        }
      }

      // 方法3: 使用 chain().insertContent()
      if (!insertSuccess) {
        try {
          if (editor.chain && typeof editor.chain === 'function') {
            await editor.chain().focus().insertContent(imageHtml).run();
            insertSuccess = true;
          }
        } catch (e) {
          // 静默处理错误
        }
      }

      // 方法4: 使用 setContent 在当前内容后追加（作为备用方案）
      if (!insertSuccess) {
        try {
          if (typeof editor.getHTML === 'function' && typeof editor.setContent === 'function') {
            const currentContent = await editor.getHTML();
            const newContent = currentContent + imageHtml;
            editor.setContent(newContent);
            insertSuccess = true;
          }
        } catch (e) {
          // 静默处理错误
        }
      }

      if (!insertSuccess) {
        Alert.alert(t('insertFailed'), t('cannotInsertDrawingToEditor'));
      }    } catch (error) {
      Alert.alert(t('insertFailed'), t('drawingInsertFailed'));
    } finally {
      setShowDrawingCanvas(false);
    }
  }, [editor]);
  const handleCancelDrawing = useCallback(() => {
    setShowDrawingCanvas(false);
  }, []);

  // 标题输入框焦点处理函数
  const handleTitleFocus = useCallback(() => {
    setIsTitleFocused(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsTitleFocused(false);
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
            paddingBottom: 0          }}>              {editor || forceShowEditor ? (              <RichTextContent
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
                onEditCategory={handleEditCategory}                onTitleFocus={handleTitleFocus}
                onTitleBlur={handleTitleBlur}
                isToolbarVisible={isKeyboardVisible || isEditorFocused || isTitleFocused}
                isKeyboardVisible={isKeyboardVisible}
              />
            ) : (              <View style={{
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
                  {t('initializingEditor')}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>        {/* 自定义工具栏：基于键盘显示状态、编辑器焦点状态或标题焦点状态显示 */}
        {editor && (isKeyboardVisible || isEditorFocused || isTitleFocused) && (
          <View style={{
            position: 'absolute',
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}>
            <CustomToolbar
              editor={editor}
              isVisible={isKeyboardVisible || isEditorFocused || isTitleFocused}
              isBold={formatStates.isBold}
              isItalic={formatStates.isItalic}
              isUnderline={formatStates.isUnderline}
              isBulletList={formatStates.isBulletList}
              isOrderedList={formatStates.isOrderedList}
              onOpenDrawing={handleOpenDrawing}
              isDisabled={false}
            />
              {/* 标题聚焦时的白色半透明遮罩 */}
            {isTitleFocused && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1001,
              }} />
            )}
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