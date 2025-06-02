import { useState, useCallback } from 'react';

/**
 * 自定义 Hook，用于管理内容的历史记录，实现撤销和重做功能
 * @param initialValue 初始内容值
 * @returns 返回当前内容、设置内容的函数、撤销函数、重做函数以及可撤销和可重做的状态
 */
export function useHistory<T>(initialValue: T) {
  // 历史记录状态，包含历史数组和当前索引
  const [historyState, setHistoryState] = useState({
    history: [initialValue],
    currentIndex: 0
  });
  
  // 当前值
  const [value, setValue] = useState<T>(initialValue);
  
  const { history, currentIndex } = historyState;
  
  // 判断是否可以撤销和重做
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;  // 设置新值并更新历史记录  const updateValue = useCallback((newValue: T) => {
    // 先检查值是否真的发生了变化
    if (newValue === value) {
      return; // 没有变化，直接返回
    }
    
    // 更新当前值
    setValue(newValue);
    
    // 同时更新历史记录和当前索引
    setHistoryState(prevState => {
      // 如果当前不是在历史记录的最后位置，需要截断历史记录
      const historyToUpdate = prevState.currentIndex < prevState.history.length - 1 
        ? prevState.history.slice(0, prevState.currentIndex + 1)
        : prevState.history;
        // 添加新版本的内容到历史记录
      const newHistory = [...historyToUpdate, newValue];
      const newIndex = newHistory.length - 1;
      
      return {
        history: newHistory,
        currentIndex: newIndex
      };
    });
  }, [value, currentIndex, history.length]);
    // 撤销操作
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = currentIndex - 1;
      setHistoryState(prevState => ({
        ...prevState,
        currentIndex: newIndex
      }));
      setValue(history[newIndex]);
    }
  }, [canUndo, currentIndex, history]);
  
  // 重做操作
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setHistoryState(prevState => ({
        ...prevState,
        currentIndex: newIndex
      }));
      setValue(history[newIndex]);
    }
  }, [canRedo, currentIndex, history]);
  
  // 重置历史记录
  const reset = useCallback((newValue: T) => {
    setValue(newValue);
    setHistoryState({
      history: [newValue],
      currentIndex: 0
    });
  }, []);
    return {
    value,       // 当前内容值
    setValue: updateValue,  // 更新内容并记录历史的函数
    undo,        // 撤销函数
    redo,        // 重做函数
    reset,       // 重置历史记录函数
    canUndo,     // 是否可以撤销
    canRedo,     // 是否可以重做
    // 调试信息
    historyLength: history.length,
    currentIndex,
    historyDebug: history
  };
}
