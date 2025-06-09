// 编辑器内容管理的自定义 Hook - 简化版本
import { useEffect, useCallback, useRef } from 'react';

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
  const lastContentRef = useRef<string>('');
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // 强制重新加载内容的方法
  const forceReloadContent = useCallback(async () => {
    if (!editor || !initialContent) return;
    
    try {
      await editor.setContent(initialContent);
      lastContentRef.current = initialContent;    } catch (error) {
      // 静默处理错误
    }
  }, [editor, initialContent]);  // 当initialContent变化时重置初始化状态（用于新笔记或切换笔记）
  useEffect(() => {
    isInitializedRef.current = false;
  }, [initialContent]);

  // 简化的初始化逻辑 - 确保初始内容能被正确设置
  useEffect(() => {
    if (!editor || isInitializedRef.current) return;
    
    let retryCount = 0;
    const maxRetries = 10;
    
    const initializeContent = async () => {
      try {
        // 检查编辑器是否可用
        await editor.getHTML();
        
        // 设置初始内容（如果有）
        if (initialContent && initialContent.trim() !== '') {
          try {
            await editor.setContent(initialContent);
            lastContentRef.current = initialContent;
          } catch (setError) {
            // 如果设置失败，可能是编辑器还没完全准备好
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(initializeContent, 500);
              return;
            }
          }
        }
        
        isInitializedRef.current = true;
      } catch (error) {
        // 编辑器还未准备好，延迟重试
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeContent, 500);
        } else {
          isInitializedRef.current = true; // 防止无限重试
        }
      }
    };
    
    // 延迟初始化，给编辑器准备时间
    setTimeout(initializeContent, 300);
  }, [editor, initialContent]); // 添加回initialContent依赖，但增加重试逻辑防止问题

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
          if (isProcessingRef.current) return; // 防止在更新过程中触发
          
          isProcessingRef.current = true;
          const currentHTML = await editor.getHTML();
          
          if (currentHTML !== lastContentRef.current) {
            lastContentRef.current = currentHTML;
            onContentChange(currentHTML);
          }
          
          isProcessingRef.current = false;
        } catch (error) {          isProcessingRef.current = false;
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
  }, [editor, onContentChange, debounceMs]);

  // 添加编辑器失焦同步
  useEffect(() => {
    if (!editor?.on) return;
    
    const handleBlur = async () => {
      try {
        if (isProcessingRef.current) return;
        
        isProcessingRef.current = true;
        const currentHTML = await editor.getHTML();
        if (currentHTML !== lastContentRef.current) {
          lastContentRef.current = currentHTML;
          onContentChange(currentHTML);
        }        isProcessingRef.current = false;
      } catch (error) {
        isProcessingRef.current = false;
        // 静默处理错误
      }
    };

    editor.on('blur', handleBlur);
    return () => editor.off?.('blur', handleBlur);
  }, [editor, onContentChange]);

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
    getCurrentContent,
    forceReloadContent
  };
}
