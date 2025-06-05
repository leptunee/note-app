// 选择模式管理Hook
import { useState, useCallback, useMemo } from 'react';
import { Animated, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface UseSelectionModeProps {
  deleteNote: (id: string) => Promise<void>;
  deleteNotes: (ids: string[]) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  setPinNotes: (ids: string[], pinned: boolean) => Promise<void>;
}

export default function useSelectionMode({ deleteNote, deleteNotes, togglePinNote, setPinNotes }: UseSelectionModeProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // 使用 useMemo 缓存动画值，避免重复创建
  const toolbarAnimation = useMemo(() => new Animated.Value(0), []);

  // 使用 useCallback 优化进入选择模式
  const enterSelectionMode = useCallback((noteId: string) => {
    setIsSelectionMode(true);
    setSelectedNotes(new Set([noteId]));
    // 显示工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [toolbarAnimation]);

  // 使用 useCallback 优化退出选择模式
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedNotes(new Set());
    // 隐藏工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [toolbarAnimation]);  // 切换笔记选择状态
  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prevSelected => {
      const newSelectedNotes = new Set(prevSelected);
      if (newSelectedNotes.has(noteId)) {
        newSelectedNotes.delete(noteId);
      } else {
        newSelectedNotes.add(noteId);
      }
      return newSelectedNotes;
    });
  }, []);  // 全选/取消全选
  const toggleSelectAll = useCallback((allNotes: any[]) => {
    setSelectedNotes(prevSelected => {
      if (prevSelected.size === allNotes.length) {
        return new Set();
      } else {
        return new Set(allNotes.map(note => note.id));
      }
    });
  }, []);
  // 删除选中的笔记
  const deleteSelectedNotes = useCallback(() => {
    const selectedCount = selectedNotes.size;
    const noteText = selectedCount === 1 ? '笔记' : '篇笔记';
    
    Alert.alert(
      '确认删除',
      `确定要删除所选的 ${selectedCount} ${noteText}吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const selectedArray = Array.from(selectedNotes);
            await deleteNotes(selectedArray);
            exitSelectionMode();
          },
        },
      ]
    );
  }, [selectedNotes, deleteNotes, exitSelectionMode]);// 置顶选中的笔记 - 使用批量操作避免卡顿
  const pinSelectedNotes = useCallback(async () => {
    const selectedArray = Array.from(selectedNotes);
    // 统一设置所有选中的笔记为置顶状态
    await setPinNotes(selectedArray, true);
    exitSelectionMode();
  }, [selectedNotes, setPinNotes, exitSelectionMode]);

  // 取消置顶选中的笔记
  const unpinSelectedNotes = useCallback(async () => {
    const selectedArray = Array.from(selectedNotes);
    // 统一设置所有选中的笔记为非置顶状态
    await setPinNotes(selectedArray, false);
    exitSelectionMode();
  }, [selectedNotes, setPinNotes, exitSelectionMode]);
  // 导出选中的笔记
  const exportSelectedNotes = useCallback(() => {
    if (selectedNotes.size === 0) {
      Alert.alert('提示', '请先选择要导出的笔记');
      return;
    }
    setShowExportDialog(true);
  }, [selectedNotes]);

  // 关闭导出对话框
  const closeExportDialog = useCallback(() => {
    setShowExportDialog(false);
  }, []);

  // 硬件返回键处理
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isSelectionMode) {
          exitSelectionMode();
          return true; // 阻止默认返回行为
        }
        return false; // 允许默认返回行为
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isSelectionMode, exitSelectionMode])
  );  return {
    isSelectionMode,
    selectedNotes,
    toolbarAnimation,
    showExportDialog,
    enterSelectionMode,
    exitSelectionMode,
    toggleNoteSelection,
    toggleSelectAll,
    deleteSelectedNotes,
    pinSelectedNotes,
    unpinSelectedNotes,
    exportSelectedNotes,
    closeExportDialog,
  };
};
