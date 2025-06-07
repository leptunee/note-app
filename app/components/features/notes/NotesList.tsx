// 笔记列表组件
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';
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
  onNotePress: (noteId: string) => void;
  onNoteLongPress: (noteId: string) => void;
  onToggleNoteSelection: (noteId: string) => void;
  truncateContent: (text: string, maxLength?: number) => string;
}

// 固定的item高度，用于性能优化
const ITEM_HEIGHT = 100; // 根据实际组件高度调整

export const NotesList = memo<NotesListProps>(({
  notes,
  isSelectionMode,
  selectedNotes,
  colors,
  onNotePress,
  onNoteLongPress,
  onToggleNoteSelection,
  truncateContent
}) => {  // 对笔记进行排序：置顶的笔记在前，然后按最后编辑时间排序
  const sortedNotes = useMemo(() => {
    return notes.slice().sort((a, b) => {
      // 首先按置顶状态排序
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // 置顶状态相同时，按最后编辑时间排序（最近编辑的在前）
      return b.updatedAt - a.updatedAt;
    });
  }, [notes]);

  // 使用 useCallback 缓存 renderItem 函数
  const renderItem = useCallback(({ item }: { item: Note }) => (
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

  return (
    <FlatList
      data={sortedNotes}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // 性能优化属性
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      legacyImplementation={false}      // 减少重新渲染
      extraData={useMemo(() => ({ 
        isSelectionMode, 
        selectedNotesSize: selectedNotes.size,
        selectedNotesIds: Array.from(selectedNotes).sort().join(',')
      }), [isSelectionMode, selectedNotes])}
      // 优化滚动性能
      disableIntervalMomentum={true}
      showsVerticalScrollIndicator={true}
    />
  );
});
