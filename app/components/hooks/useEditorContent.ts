// 编辑器内容管理的自定义 Hook
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
  // 只在首次初始化时设置内容，或者当外部内容发生显著变化时更新
  useEffect(() => {
    if (!editor || !editor.setContent) return;    const initializeContent = async () => {
      try {
        // 如果还没有初始化，进行初始化
        if (!hasBeenInitialized) {
          editor.setContent(initialContent);
          lastContentRef.current = initialContent;
          setHasBeenInitialized(true);
          return;
        }
        
        // 如果已经初始化，只有在外部内容显著不同且编辑器未聚焦时才更新
        const currentHTML = (await editor.getHTML?.()) || '';
        const contentLengthDiff = Math.abs(currentHTML.length - initialContent.length);
        const shouldUpdate = contentLengthDiff > 10 && // 内容长度差异超过10个字符
                           currentHTML !== initialContent && 
                           !editor.isFocused?.() && // 编辑器未聚焦
                           !isUpdating; // 不在更新过程中
        
        if (shouldUpdate) {
          editor.setContent(initialContent);
          lastContentRef.current = initialContent;
        }
      } catch (error) {
        // 静默处理初始化错误
      }
    };

    // 延迟初始化，确保编辑器完全准备好
    const timeoutId = setTimeout(initializeContent, 100);
    return () => clearTimeout(timeoutId);
  }, [editor, initialContent, hasBeenInitialized, isUpdating]);

  // 监听编辑器内容变化，使用防抖
  useEffect(() => {
    if (!editor?.on || !hasBeenInitialized) return;    const handleContentUpdate = () => {
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
          // 静默处理错误
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
    if (!editor?.on || !hasBeenInitialized) return;    const handleBlur = async () => {
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
