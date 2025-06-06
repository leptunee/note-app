import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, ImageBackground, Platform, Keyboard, KeyboardAvoidingView, Text, TextInput, StatusBar } from 'react-native';
import { useEditorBridge, TenTapStarterKit } from '@10play/tentap-editor';
import { NoteHeader, RichTextContent, ExportModal, PageSettingsModal, CustomToolbar, styles, Toast, ExportView, CategorySelector, CategoryModal, type ToastRef } from './components';
import { useEditorContent } from './components/hooks/useEditorContent';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null);
  const titleInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);  const [isEditorReady, setIsEditorReady] = useState(false);  const {
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
  } = useNoteEdit(themes, toastRef, titleInputRef);// 创建编辑器实例 - 确保内容加载后再创建
  const editor = useEditorBridge({
    autofocus: false,
    avoidIosKeyboard: false,
    initialContent: content || '',
    bridgeExtensions: TenTapStarterKit,
  });  // 撤销/重做处理函数
  const handleUndo = useCallback(() => {
    console.log('↶ [DEBUG] 撤销操作被触发');
    if (editor && editor.undo) {
      try {
        editor.undo();
        console.log('✅ [DEBUG] 撤销操作执行成功');
        
        // 检查撤销后的状态
        setTimeout(() => {
          const newCanUndo = editor.canUndo || false;
          const newCanRedo = editor.canRedo || false;
          console.log(`📊 [DEBUG] 撤销后状态 - canUndo: ${newCanUndo}, canRedo: ${newCanRedo}`);
        }, 50);
      } catch (error) {
        console.log('❌ [DEBUG] 撤销操作失败:', error);
      }
    } else {
      console.log('⚠️ [DEBUG] 撤销操作失败 - editor.undo 不可用');
    }
  }, [editor]);

  const handleRedo = useCallback(() => {
    console.log('↷ [DEBUG] 重做操作被触发');
    if (editor && editor.redo) {
      try {
        editor.redo();
        console.log('✅ [DEBUG] 重做操作执行成功');
        
        // 检查重做后的状态
        setTimeout(() => {
          const newCanUndo = editor.canUndo || false;
          const newCanRedo = editor.canRedo || false;
          console.log(`📊 [DEBUG] 重做后状态 - canUndo: ${newCanUndo}, canRedo: ${newCanRedo}`);
        }, 50);
      } catch (error) {
        console.log('❌ [DEBUG] 重做操作失败:', error);
      }
    } else {
      console.log('⚠️ [DEBUG] 重做操作失败 - editor.redo 不可用');
    }
  }, [editor]);// 监听编辑器的撤销/重做状态变化
  useEffect(() => {
    if (!editor || !isEditorReady) return;
    
    console.log('🎯 [DEBUG] 编辑器状态监听器已初始化');

    const updateUndoRedoState = (eventName?: string) => {
      try {
        const newCanUndo = editor.canUndo || false;
        const newCanRedo = editor.canRedo || false;
        
        console.log(`📊 [DEBUG] 撤销/重做状态更新 - canUndo: ${newCanUndo}, canRedo: ${newCanRedo}`);
        
        setCanUndo(newCanUndo);
        setCanRedo(newCanRedo);
      } catch (error) {
        console.log('❌ [DEBUG] 更新撤销/重做状态失败:', error);
      }
    };

    // 立即检查一次状态
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
      }    };
  }, [editor, isEditorReady, setCanUndo, setCanRedo]);
  // 编辑器准备就绪后的自动保存功能 - 多种备用方法
  useEffect(() => {
    if (!editor || !isEditorReady || !content) return;
    
    console.log('💾 [DEBUG] 编辑器准备就绪，开始自动保存当前状态');
    
    // 延迟一段时间确保编辑器完全准备就绪
    const timer = setTimeout(async () => {
      let success = false;
      
      // 方法1：尝试使用 commands.setContent
      if (!success && editor.commands && typeof editor.commands.setContent === 'function') {
        try {
          console.log('🔄 [DEBUG] 自动保存方法1 - 使用 editor.commands.setContent');
          editor.commands.setContent(content);
          console.log('✅ [DEBUG] 自动保存方法1成功');
          success = true;
        } catch (error) {
          console.log('❌ [DEBUG] 自动保存方法1失败:', error);
        }
      }
      
      // 方法2：尝试使用 chain
      if (!success && editor.chain && typeof editor.chain === 'function') {
        try {
          console.log('🔄 [DEBUG] 自动保存方法2 - 使用 editor.chain().focus().selectAll().setContent()');
          const result = editor.chain().focus().selectAll().setContent(content).run();
          console.log('✅ [DEBUG] 自动保存方法2成功:', result);
          success = true;
        } catch (error) {
          console.log('❌ [DEBUG] 自动保存方法2失败:', error);
        }
      }
      
      // 方法3：尝试使用 setContent 方法（如果存在）
      if (!success && typeof editor.setContent === 'function') {
        try {
          console.log('🔄 [DEBUG] 自动保存方法3 - 使用 editor.setContent');
          editor.setContent(content);
          console.log('✅ [DEBUG] 自动保存方法3成功');
          success = true;
        } catch (error) {
          console.log('❌ [DEBUG] 自动保存方法3失败:', error);
        }
      }
      
      // 方法4：尝试通过 view 直接操作
      if (!success && editor.view && editor.view.dispatch) {
        try {
          console.log('🔄 [DEBUG] 自动保存方法4 - 使用 editor.view.dispatch');
          const { state } = editor.view;
          const tr = state.tr;
          
          // 选择全部内容并替换
          tr.selectAll();
          tr.insertText('');
          tr.insertText(content);
          
          // 确保记录历史
          tr.setMeta('addToHistory', true);
          
          editor.view.dispatch(tr);
          console.log('✅ [DEBUG] 自动保存方法4成功');
          success = true;
        } catch (error) {
          console.log('❌ [DEBUG] 自动保存方法4失败:', error);
        }
      }
      
      // 方法5：如果有 TenTap 特定的方法
      if (!success && editor.tentap && typeof editor.tentap.setContent === 'function') {
        try {
          console.log('🔄 [DEBUG] 自动保存方法5 - 使用 editor.tentap.setContent');
          editor.tentap.setContent(content);
          console.log('✅ [DEBUG] 自动保存方法5成功');
          success = true;
        } catch (error) {
          console.log('❌ [DEBUG] 自动保存方法5失败:', error);
        }
      }
      
      // 如果所有方法都失败，记录可用的方法
      if (!success) {
        console.log('⚠️ [DEBUG] 所有自动保存方法都失败，编辑器可用属性:');
        console.log('- editor.commands:', !!editor.commands);
        console.log('- editor.chain:', !!editor.chain);
        console.log('- editor.setContent:', typeof editor.setContent);
        console.log('- editor.view:', !!editor.view);
        console.log('- editor.tentap:', !!editor.tentap);
        console.log('- editor 类型:', typeof editor);
        console.log('- editor keys:', Object.keys(editor));
      }
      
      // 延迟检查undo/redo状态
      setTimeout(() => {
        const newCanUndo = editor.canUndo || false;
        const newCanRedo = editor.canRedo || false;
        console.log(`📊 [DEBUG] 自动保存后状态 - canUndo: ${newCanUndo}, canRedo: ${newCanRedo}, success: ${success}`);
        setCanUndo(newCanUndo);
        setCanRedo(newCanRedo);
      }, 200);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [editor, isEditorReady, content, setCanUndo, setCanRedo]);
  
  // 使用 useEditorContent hook 管理内容同步
  useEditorContent({
    editor,
    initialContent: content,
    onContentChange: handleContentChange,
    debounceMs: 500  });  // 检查编辑器是否准备就绪 - 简化逻辑
  useEffect(() => {
    if (!editor) return;
    
    console.log('🔍 [DEBUG] 开始检查编辑器是否准备就绪');
    
    let timeoutId: any;
    let checkCount = 0;
    const maxChecks = 30; // 增加检查次数，每次间隔100ms，总共3秒
    
    const checkEditorReady = () => {
      console.log(`🔍 [DEBUG] 编辑器准备状态检查 #${checkCount + 1}`);
      
      if (editor && typeof editor.getHTML === 'function') {
        try {
          // 尝试调用 getHTML 方法，如果成功则说明编辑器已准备就绪
          editor.getHTML();
          console.log('✅ [DEBUG] 编辑器准备就绪检查成功');
          setIsEditorReady(true);
          return;
        } catch (error) {
          console.log(`⚠️ [DEBUG] 编辑器准备状态检查失败 #${checkCount + 1}:`, error);
        }
      }
      
      checkCount++;
      if (checkCount < maxChecks) {
        timeoutId = setTimeout(checkEditorReady, 100);
      } else {
        console.log('⚠️ [DEBUG] 编辑器准备状态检查超时，强制设为准备就绪');
        // 即使超时也设置为准备就绪，避免永久加载
        setIsEditorReady(true);
      }
    };

    // 立即开始检查
    checkEditorReady();
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editor]);
  // 当编辑器准备就绪并且内容加载完成后，自动保存当前状态
  useEffect(() => {
    if (!editor || !isEditorReady) return;
    
    // 延迟一小段时间确保内容完全加载
    const timeoutId = setTimeout(async () => {
      try {
        console.log('💾 [DEBUG] 编辑器准备就绪，检查当前内容');
        
        // 获取当前编辑器内容
        const currentContent = await editor.getHTML();
        console.log('📄 [DEBUG] 当前编辑器内容长度:', currentContent?.length || 0);
        
        // 如果编辑器有内容，尝试创建历史记录点
        if (currentContent && currentContent.trim() !== '') {
          console.log('🔄 [DEBUG] 尝试创建初始历史记录点');
          
          // 方法1: 尝试使用 setContent 重新设置内容
          try {
            await editor.setContent(currentContent);
            console.log('✅ [DEBUG] 通过 setContent 创建历史记录点成功');
          } catch (error) {
            console.log('⚠️ [DEBUG] setContent 方法失败:', error);
            
            // 方法2: 尝试模拟用户输入来创建历史记录点
            try {
              if (editor.chain && typeof editor.chain === 'function') {
                editor.chain().focus().selectAll().setContent(currentContent).run();
                console.log('✅ [DEBUG] 通过 chain 创建历史记录点成功');
              } else {
                console.log('⚠️ [DEBUG] chain 方法不可用');
              }
            } catch (chainError) {
              console.log('⚠️ [DEBUG] chain 方法失败:', chainError);
              
              // 方法3: 直接触发编辑器更新
              try {
                if (editor.view && editor.view.dispatch) {
                  // 创建一个空的事务来触发历史记录
                  const tr = editor.view.state.tr;
                  editor.view.dispatch(tr);
                  console.log('✅ [DEBUG] 通过 dispatch 创建历史记录点成功');
                } else {
                  console.log('⚠️ [DEBUG] view.dispatch 不可用');
                }
              } catch (dispatchError) {
                console.log('⚠️ [DEBUG] dispatch 方法失败:', dispatchError);
              }
            }
          }
        } else {
          console.log('📝 [DEBUG] 编辑器内容为空，跳过历史记录点创建');
        }
        
        // 更新 undo/redo 状态
        setTimeout(() => {
          try {
            const newCanUndo = editor.canUndo || false;
            const newCanRedo = editor.canRedo || false;
            console.log(`📊 [DEBUG] 初始化后状态 - canUndo: ${newCanUndo}, canRedo: ${newCanRedo}`);
            setCanUndo(newCanUndo);
            setCanRedo(newCanRedo);
          } catch (error) {
            console.log('❌ [DEBUG] 更新状态失败:', error);
          }
        }, 100);
        
      } catch (error) {
        console.warn('Failed to auto-save initial state:', error);
      }
    }, 500); // 等待500ms确保内容完全加载

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [editor, isEditorReady, setCanUndo, setCanRedo]);

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
      handleSave(latestContent, true); // 显示toast，用户点击保存按钮应该有反馈
      
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

  // 使用 useMemo 缓存计算的样式值，避免无限重新渲染
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
  }, [pageSettings, colorScheme]);return (
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
      />        <View style={[
        styles.container,
        { backgroundColor: containerBackgroundColor }
      ]}>        {pageSettings.backgroundImageUri && (
          <ImageBackground
            source={{ uri: pageSettings.backgroundImageUri }}
            style={[
              styles.backgroundImage,
              backgroundStyles
            ]}
            resizeMode="cover"
            blurRadius={pageSettings.backgroundImageBlur || 0}
          />
        )}        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header 不受页边距影响 */}          <NoteHeader
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
          />          {/* 内容区域受页边距影响 */}
          <View style={{ 
            flex: 1, 
            paddingHorizontal: contentPadding,
            paddingTop: 0,
            paddingBottom: 0          }}>
            
            {editor && isEditorReady ? (              <RichTextContent
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
                titleInputRef={titleInputRef}                categories={categories}
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
        </KeyboardAvoidingView>{/* 工具栏 - 只在键盘弹起时显示，并固定在键盘上方 */}
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
        />        <PageSettingsModal
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
