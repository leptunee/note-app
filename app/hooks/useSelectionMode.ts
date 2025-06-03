// 选择模式管理Hook
import { useState, useCallback } from 'react';
import { Animated, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface UseSelectionModeProps {
  deleteNote: (id: string) => Promise<void>;
}

export default function useSelectionMode({ deleteNote }: UseSelectionModeProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [toolbarAnimation] = useState(new Animated.Value(0));

  // 进入选择模式
  const enterSelectionMode = useCallback((noteId: string) => {
    setIsSelectionMode(true);
    setSelectedNotes(new Set([noteId]));
    // 显示工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [toolbarAnimation]);

  // 退出选择模式
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedNotes(new Set());
    // 隐藏工具栏动画
    Animated.spring(toolbarAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [toolbarAnimation]);

  // 切换笔记选择状态
  const toggleNoteSelection = useCallback((noteId: string) => {
    const newSelectedNotes = new Set(selectedNotes);
    if (newSelectedNotes.has(noteId)) {
      newSelectedNotes.delete(noteId);
    } else {
      newSelectedNotes.add(noteId);
    }
    setSelectedNotes(newSelectedNotes);
    
    // 如果没有选中的笔记，退出选择模式
    if (newSelectedNotes.size === 0) {
      exitSelectionMode();
    }
  }, [selectedNotes, exitSelectionMode]);

  // 全选/取消全选
  const toggleSelectAll = useCallback((allNotes: any[]) => {
    if (selectedNotes.size === allNotes.length) {
      setSelectedNotes(new Set());
      exitSelectionMode();
    } else {
      setSelectedNotes(new Set(allNotes.map(note => note.id)));
    }
  }, [selectedNotes, exitSelectionMode]);

  // 删除选中的笔记
  const deleteSelectedNotes = useCallback(() => {
    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedNotes.size} 条笔记吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            for (const noteId of selectedNotes) {
              await deleteNote(noteId);
            }
            exitSelectionMode();
          },
        },
      ]
    );
  }, [selectedNotes, deleteNote, exitSelectionMode]);

  // 置顶选中的笔记 (暂时占位，后续可实现)
  const pinSelectedNotes = useCallback(() => {
    Alert.alert('功能开发中', '置顶功能正在开发中');
  }, []);

  // 导出选中的笔记 (暂时占位，后续可实现)
  const exportSelectedNotes = useCallback(() => {
    Alert.alert('功能开发中', '批量导出功能正在开发中');
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
  );

  return {
    isSelectionMode,
    selectedNotes,
    toolbarAnimation,
    enterSelectionMode,
    exitSelectionMode,
    toggleNoteSelection,
    toggleSelectAll,
    deleteSelectedNotes,
    pinSelectedNotes,
    exportSelectedNotes,
  };
};
