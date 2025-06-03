// 笔记列表组件
import React from 'react';
import { FlatList } from 'react-native';
import { NoteItem } from './NoteItem';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
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
}) => {
  return (
    <FlatList
      data={notes}
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
