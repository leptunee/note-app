// 笔记列表组件
import React from 'react';
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

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  isSelectionMode,
  selectedNotes,
  colors,
  onNotePress,
  onNoteLongPress,
  onToggleNoteSelection,
  truncateContent
}) => {  // 对笔记进行排序：置顶的笔记在前，然后按最后编辑时间排序
  const sortedNotes = notes.slice().sort((a, b) => {
    // 首先按置顶状态排序
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // 置顶状态相同时，按最后编辑时间排序（最近编辑的在前）
    return b.updatedAt - a.updatedAt;
  });

  return (
    <FlatList
      data={sortedNotes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
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
      )}
    />
  );
};
