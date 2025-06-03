import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import { NotesHeader, NotesList, SelectionToolbar } from './components';
import { BatchExportDialog } from './components/BatchExportDialog';
import useSelectionMode from './hooks/useSelectionMode';

export default function NotesScreen() {
  const { notes, refreshNotes, deleteNote, togglePinNote, setPinNotes } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  // 使用选择模式Hook
  const {
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
  } = useSelectionMode({ deleteNote, togglePinNote, setPinNotes });  // 仅在页面首次获得焦点或从编辑页面返回时刷新笔记列表
  useFocusEffect(
    useCallback(() => {
      refreshNotes();
    }, [refreshNotes])
  );

  // 截断长内容，只显示前若干个字符
  const truncateContent = useCallback((text: string, maxLength: number = 80) => {
    // 先移除HTML标签，获取纯文本内容
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }, []);

  // 计算的颜色值，避免重复计算
  const colors = useMemo(() => ({
    tint: Colors[colorScheme].tint,
    text: colorScheme === 'dark' ? '#fff' : '#000',
    background: colorScheme === 'dark' ? '#000' : '#fff',
    cardBackground: colorScheme === 'dark' ? '#222' : '#f9f9f9',
    toolbarBackground: colorScheme === 'dark' ? '#333' : '#f8f8f8',
    toolbarText: colorScheme === 'dark' ? '#fff' : '#333',
    secondaryText: colorScheme === 'dark' ? '#ccc' : '#666',
    tertiaryText: colorScheme === 'dark' ? '#888' : '#999',
  }), [colorScheme]);  // 处理笔记点击
  const handleNotePress = useCallback((noteId: string) => {
    if (isSelectionMode) {
      toggleNoteSelection(noteId);
    } else {
      router.push({ 
        pathname: '/note-edit', 
        params: { 
          id: noteId
        } 
      });
    }
  }, [isSelectionMode, toggleNoteSelection, router]);

  // 获取选中的笔记数据
  const selectedNotesData = useMemo(() => {
    const selectedIds = Array.from(selectedNotes);
    return notes.filter(note => selectedIds.includes(note.id));
  }, [notes, selectedNotes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NotesHeader
        title={String(t('notes'))}
        colors={colors}
        onAboutPress={() => router.push('/about')}
        onAddPress={() => router.push('/note-edit')}
      />

      <NotesList
        notes={notes}
        isSelectionMode={isSelectionMode}
        selectedNotes={selectedNotes}
        colors={colors}
        onNotePress={handleNotePress}
        onNoteLongPress={enterSelectionMode}
        onToggleNoteSelection={toggleNoteSelection}
        truncateContent={truncateContent}
      />      <SelectionToolbar
        isVisible={isSelectionMode}
        toolbarAnimation={toolbarAnimation}
        selectedCount={selectedNotes.size}
        totalCount={notes.length}
        colors={colors}
        onExitSelection={exitSelectionMode}
        onToggleSelectAll={() => toggleSelectAll(notes)}
        onDeleteSelected={deleteSelectedNotes}
        onPinSelected={pinSelectedNotes}
        onUnpinSelected={unpinSelectedNotes}
        onExportSelected={exportSelectedNotes}
        selectedNotes={selectedNotes}
        notes={notes}
      />      <BatchExportDialog
        visible={showExportDialog}
        onClose={closeExportDialog}
        notes={selectedNotesData}
        selectedCount={selectedNotes.size}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
});

