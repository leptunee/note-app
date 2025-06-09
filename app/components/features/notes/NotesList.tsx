// 笔记列表组件 - 性能优化版本
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { NoteItem } from './NoteItem';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

interface NotesListProps {
  notes: Note[];
  isSelectionMode: boolean;
  selectedNotes: Set<string>;
  colors: {
    cardBackground: string;
    tint: string;
    text: string;
    secondaryText: string;
    tertiaryText: string;
  };
  onNotePress: (noteId: string) => void;  onNoteLongPress: (noteId: string) => void;
  onToggleNoteSelection: (noteId: string) => void;
  truncateContent: (text: string, maxLength?: number) => string;
}

// 固定的item高度，用于性能优化
const ITEM_HEIGHT = 100;

export const NotesList = memo<NotesListProps>(({
  notes,
  isSelectionMode,
  selectedNotes,
  colors,
  onNotePress,
  onNoteLongPress,
  onToggleNoteSelection,
  truncateContent
}) => {
  // 使用 useMemo 缓存排序后的笔记列表
  const sortedNotes = useMemo(() => {
    return notes.slice().sort((a, b) => {
      // 首先按置顶状态排序
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // 置顶状态相同时，按最后编辑时间排序（最近编辑的在前）
      return b.updatedAt - a.updatedAt;    });
  }, [notes]);

  // 使用 useCallback 缓存 renderItem 函数
  const renderItem = useCallback<ListRenderItem<Note>>(({ item }) => (
    <NoteItem
      note={item}
      isSelectionMode={isSelectionMode}
      isSelected={selectedNotes.has(item.id)}
      colors={colors}
      onPress={() => onNotePress(item.id)}
      onLongPress={() => onNoteLongPress(item.id)}
      onToggleSelection={() => onToggleNoteSelection(item.id)}
      truncateContent={truncateContent}
    />
  ), [isSelectionMode, selectedNotes, colors, onNotePress, onNoteLongPress, onToggleNoteSelection, truncateContent]);

  // 缓存 keyExtractor 函数
  const keyExtractor = useCallback((item: Note) => item.id, []);

  // 添加getItemLayout优化
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);
  // 缓存 extraData 对象以减少重新渲染
  const extraData = useMemo(() => ({ 
    isSelectionMode, 
    selectedNotesSize: selectedNotes.size,
    selectedNotesIds: Array.from(selectedNotes).sort().join(',')
  }), [isSelectionMode, selectedNotes]);

  // 计算内容样式，在多选模式下添加底部内边距避免工具栏遮挡
  const contentContainerStyle = useMemo(() => ({
    paddingBottom: isSelectionMode ? 100 : 16, // 多选模式下预留工具栏空间
  }), [isSelectionMode]);
  return (
    <FlatList
      data={sortedNotes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      extraData={extraData}
      contentContainerStyle={contentContainerStyle}
      // 性能优化属性
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}      legacyImplementation={false}
      // 优化滚动性能
      disableIntervalMomentum={true}
      showsVerticalScrollIndicator={false}
    />
  );
});
