import { useState, useCallback } from 'react';

/**
 * 自定义 Hook，用于管理内容的历史记录，实现撤销和重做功能
 * @param initialValue 初始内容值
 * @returns 返回当前内容、设置内容的函数、撤销函数、重做函数以及可撤销和可重做的状态
 */
export function useHistory<T>(initialValue: T) {
  // 历史记录状态
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 当前值
  const [value, setValue] = useState<T>(initialValue);
  
  // 判断是否可以撤销和重做
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  // 设置新值并更新历史记录
  const updateValue = useCallback((newValue: T) => {
    if (newValue !== value) {
      // 如果当前不是在历史记录的最后位置，需要截断历史记录
      if (currentIndex < history.length - 1) {
        setHistory(prevHistory => prevHistory.slice(0, currentIndex + 1));
      }
      
      // 添加新版本的内容到历史记录
      setHistory(prevHistory => [...prevHistory, newValue]);
      setCurrentIndex(prevIndex => prevIndex + 1);
      setValue(newValue);
    }
  }, [value, history, currentIndex]);
  
  // 撤销操作
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [canUndo, currentIndex, history]);
  
  // 重做操作
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setValue(history[newIndex]);
    }
  }, [canRedo, currentIndex, history]);
  
  // 重置历史记录
  const reset = useCallback((newValue: T) => {
    setValue(newValue);
    setHistory([newValue]);
    setCurrentIndex(0);
  }, []);
  
  return {
    value,       // 当前内容值
    setValue: updateValue,  // 更新内容并记录历史的函数
    undo,        // 撤销函数
    redo,        // 重做函数
    reset,       // 重置历史记录函数
    canUndo,     // 是否可以撤销
    canRedo      // 是否可以重做
  };
}
