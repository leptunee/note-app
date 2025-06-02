// 编辑器内容管理的自定义 Hook - 修复版本
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEditorContentProps {
  editor: any;
  initialContent: string;
  onContentChange: (content: string) => void;
  debounceMs?: number;
}

export function useEditorContent({
  editor,
  initialContent,
  onContentChange,
  debounceMs = 500
}: UseEditorContentProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  const lastContentRef = useRef<string>('');
  const debounceTimeoutRef = useRef<number | null>(null);

  // 初始化编辑器内容管理，避免干扰撤销历史
  useEffect(() => {
    if (!editor) return;
    
    const initializeContent = async () => {
      try {
        // 如果还没有初始化，标记为已初始化但不设置内容
        // 让编辑器使用 initialContent 配置自行初始化
        if (!hasBeenInitialized) {
          // 等待编辑器准备好
          if (editor.getHTML) {
            const currentContent = (await editor.getHTML()) || '';
            lastContentRef.current = currentContent;
            setHasBeenInitialized(true);
            console.log('Editor initialized with content:', currentContent.substring(0, 100));
          }
          return;
        }
        
        // 如果已经初始化，只有在外部内容显著不同且编辑器未聚焦时才更新
        const currentHTML = (await editor.getHTML?.()) || '';
        
        // 只在内容完全不同且编辑器未聚焦时才更新（支持撤销/重做）
        const shouldUpdate = currentHTML !== initialContent && 
                           !editor.isFocused?.() && 
                           !isUpdating;
        
        if (shouldUpdate) {
          editor.setContent(initialContent);
          lastContentRef.current = initialContent;
          console.log('Content updated from external source');
        }
      } catch (error) {
        console.warn('Error in content initialization:', error);
      }
    };

    // 延迟初始化，确保编辑器完全准备好
    const timeoutId = setTimeout(initializeContent, 200);
    return () => clearTimeout(timeoutId);
  }, [editor, initialContent, hasBeenInitialized, isUpdating]);

  // 监听编辑器内容变化，使用防抖
  useEffect(() => {
    if (!editor?.on || !hasBeenInitialized) return;
    
    const handleContentUpdate = () => {
      // 清除之前的防抖定时器
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          if (isUpdating) return; // 防止在更新过程中触发

          const currentHTML = await editor.getHTML();
          
          if (currentHTML !== lastContentRef.current) {
            lastContentRef.current = currentHTML;
            setIsUpdating(true);
            onContentChange(currentHTML);
            // 使用 Promise 来延迟设置状态
            Promise.resolve().then(() => setIsUpdating(false));
          }
        } catch (error) {
          console.warn('Error getting editor content:', error);
        }
      }, debounceMs);
    };

    // 监听编辑器的更新事件
    editor.on('update', handleContentUpdate);
    
    return () => {
      editor.off?.('update', handleContentUpdate);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [editor, onContentChange, isUpdating, debounceMs, hasBeenInitialized]);

  // 添加编辑器失焦同步
  useEffect(() => {
    if (!editor?.on || !hasBeenInitialized) return;
    
    const handleBlur = async () => {
      try {
        if (isUpdating) return;
        
        const currentHTML = await editor.getHTML();
        if (currentHTML !== lastContentRef.current) {
          lastContentRef.current = currentHTML;
          onContentChange(currentHTML);
        }
      } catch (error) {
        // 静默处理错误
      }
    };

    editor.on('blur', handleBlur);
    return () => editor.off?.('blur', handleBlur);
  }, [editor, onContentChange, isUpdating, hasBeenInitialized]);

  // 获取当前编辑器内容的方法
  const getCurrentContent = useCallback(async () => {
    if (!editor?.getHTML) return initialContent;
    try {
      return await editor.getHTML();
    } catch (error) {
      console.warn('Failed to get current content:', error);
      return initialContent;
    }
  }, [editor, initialContent]);

  return {
    isUpdating,
    getCurrentContent
  };
}
