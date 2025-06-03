// 编辑器内容管理的自定义 Hook - 简化版本
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
  const lastContentRef = useRef<string>('');
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // 强制重新加载内容的方法
  const forceReloadContent = useCallback(async () => {
    if (!editor || !initialContent) return;
    
    try {
      await editor.setContent(initialContent);
      lastContentRef.current = initialContent;
    } catch (error) {
      console.warn('Failed to force reload content:', error);
    }
  }, [editor, initialContent]);

  // 简化的初始化逻辑 - 直接设置内容，不等待
  useEffect(() => {
    if (!editor || isInitializedRef.current) return;
    
    const initializeContent = async () => {
      try {
        // 如果有初始内容，立即设置，不做任何检查
        if (initialContent && initialContent.trim() !== '') {
          await editor.setContent(initialContent);
          lastContentRef.current = initialContent;
        }
        
        isInitializedRef.current = true;
      } catch (error) {
        // 如果设置失败，等待一下再试一次
        setTimeout(async () => {
          try {
            if (initialContent && initialContent.trim() !== '') {
              await editor.setContent(initialContent);
              lastContentRef.current = initialContent;
            }
            isInitializedRef.current = true;
          } catch (retryError) {
            console.warn('Editor initialization failed after retry:', retryError);
            isInitializedRef.current = true;
          }
        }, 100);
      }
    };
    
    // 立即初始化，不延迟
    initializeContent();
  }, [editor, initialContent]);

  // 监听编辑器内容变化，使用防抖
  useEffect(() => {
    if (!editor?.on) return;
    
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
          console.warn('Error handling content update:', error);
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
  }, [editor, onContentChange, isUpdating, debounceMs]);

  // 添加编辑器失焦同步
  useEffect(() => {
    if (!editor?.on) return;
    
    const handleBlur = async () => {
      try {
        if (isUpdating) return;
        
        const currentHTML = await editor.getHTML();
        if (currentHTML !== lastContentRef.current) {
          lastContentRef.current = currentHTML;
          onContentChange(currentHTML);
        }
      } catch (error) {
        console.warn('Error handling blur:', error);
      }
    };

    editor.on('blur', handleBlur);
    return () => editor.off?.('blur', handleBlur);
  }, [editor, onContentChange, isUpdating]);

  // 获取当前编辑器内容的方法
  const getCurrentContent = useCallback(async () => {
    if (!editor?.getHTML) return initialContent;
    try {
      return await editor.getHTML();
    } catch (error) {
      return initialContent;
    }
  }, [editor, initialContent]);

  return {
    isUpdating,
    getCurrentContent,
    forceReloadContent
  };
}
