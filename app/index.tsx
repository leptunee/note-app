import React, { useCallback, useMemo, useState, memo } from 'react';
import { View, StyleSheet, useColorScheme, StatusBar } from 'react-native';
import { useNotes, Category } from '@/src/hooks/useNotes';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import { NotesHeader, NotesList, SelectionToolbar, CategorySidebar } from './components';
import { CategoryModal, CategorySelectorModal, BatchExportDialog } from './components/LazyComponents';
import useSelectionMode from '@/src/hooks/useSelectionMode';
import { v4 as uuidv4 } from 'uuid';

const NotesScreen = memo(() => {
  const { 
    notes, 
    categories, 
    refreshNotes, 
    deleteNote, 
    deleteNotes,
    togglePinNote, 
    setPinNotes,
    addCategory,
    updateCategory,
    deleteCategory,
    updateNoteCategory,
    updateMultipleNoteCategories,
    getNotesByCategory
  } = useNotes();
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  // 页面聚焦时刷新笔记数据
  useFocusEffect(
    useCallback(() => {
      refreshNotes();
    }, [refreshNotes])
  );  // 分类相关状态
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [moveSelectorVisible, setMoveSelectorVisible] = useState(false);
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
  } = useSelectionMode({ deleteNote, deleteNotes, togglePinNote, setPinNotes });  // 侧边栏控制函数 - 使用useCallback优化
  const openSidebar = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  // 分类选择处理 - 使用useCallback优化
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    closeSidebar();
  }, [closeSidebar]);

  // 添加分类 - 使用useCallback优化
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCategoryModalVisible(true);
  }, []);

  // 编辑分类 - 使用useCallback优化
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setCategoryModalVisible(true);
  }, []);
  // 保存分类 - 使用useCallback优化
  const handleSaveCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCategory) {
      // 编辑现有分类
      const updatedCategory: Category = {
        ...editingCategory,
        ...categoryData,
        updatedAt: Date.now(),
      };
      await updateCategory(updatedCategory);
    } else {
      // 添加新分类
      const newCategory: Category = {
        id: uuidv4(),
        ...categoryData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await addCategory(newCategory);
    }
  }, [editingCategory, updateCategory, addCategory]);

  // 删除分类 - 使用useCallback优化
  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    await deleteCategory(categoryId);
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('all');
    }
  }, [deleteCategory, selectedCategoryId]);

  // 打开移动选择器 - 使用useCallback优化
  const handleMoveSelected = useCallback(() => {
    setMoveSelectorVisible(true);
  }, []);

  // 移动选择的笔记到指定分类 - 使用useCallback优化
  const handleMoveNotesToCategory = useCallback(async (categoryId: string) => {
    const selectedNotesArray: string[] = Array.from(selectedNotes);
    
    // 使用批量更新避免竞态条件
    await updateMultipleNoteCategories(selectedNotesArray, categoryId);
    
    // 关闭移动选择器并退出选择模式
    setMoveSelectorVisible(false);
    exitSelectionMode();
  }, [selectedNotes, updateMultipleNoteCategories, exitSelectionMode]);
  // 计算每个分类的笔记数量 - 使用useMemo优化
  const notesCounts = useMemo(() => {
    const counts: { [categoryId: string]: number } = {};
    categories.forEach(category => {
      counts[category.id] = getNotesByCategory(category.id).length;
    });
    return counts;
  }, [categories, notes, getNotesByCategory]);

  // 根据选中的分类筛选笔记 - 使用useMemo优化
  const filteredNotes = useMemo(() => {
    return getNotesByCategory(selectedCategoryId);
  }, [notes, selectedCategoryId, getNotesByCategory]);  // 获取当前选中的分类信息 - 使用useMemo优化
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return { name: String(t('allNotes')), icon: 'file-text', color: '#2196F3' };
    }
    return categories.find(cat => cat.id === selectedCategoryId) || 
      { name: String(t('uncategorized')), icon: 'folder', color: '#999999' };
  }, [selectedCategoryId, categories, t]);

  // 截断长内容，只显示前若干个字符
  const truncateContent = useCallback((text: string, maxLength: number = 80) => {
    // 先移除HTML标签，获取纯文本内容
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }, []);
  // 计算的颜色值，避免重复计算 - 使用useMemo优化
  const colors = useMemo(() => ({
    tint: Colors[colorScheme].tint,
    text: colorScheme === 'dark' ? '#fff' : '#000',
    background: colorScheme === 'dark' ? '#000' : '#fff',
    cardBackground: colorScheme === 'dark' ? '#222' : '#f9f9f9',
    toolbarBackground: colorScheme === 'dark' ? '#333' : '#f8f8f8',
    toolbarText: colorScheme === 'dark' ? '#fff' : '#333',
    secondaryText: colorScheme === 'dark' ? '#ccc' : '#666',
    tertiaryText: colorScheme === 'dark' ? '#888' : '#999',
  }), [colorScheme]);

  // 处理笔记点击 - 使用useCallback优化
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
  // 处理搜索按钮点击 - 使用useCallback优化
  const handleSearchPress = useCallback(() => {
    router.push('/search');
  }, [router]);

  // 处理关于页面按钮点击 - 使用useCallback优化
  const handleAboutPress = useCallback(() => {
    router.push('/about');
  }, [router]);

  // 获取选中的笔记数据 - 总是从原始notes中获取 - 使用useMemo优化
  const selectedNotesData = useMemo(() => {
    const selectedIds = Array.from(selectedNotes);
    return notes.filter(note => selectedIds.includes(note.id));
  }, [notes, selectedNotes]);return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme].background}
        translucent={false}
      />      <NotesHeader
        title={['allNotes', 'uncategorized', 'work', 'personal', 'study'].includes(selectedCategory.name) ? t(selectedCategory.name) : selectedCategory.name}
        categoryIcon={selectedCategory.icon}
        categoryColor={selectedCategory.color}
        colors={colors}
        onAddPress={() => router.push('/note-edit')}
        onSearchPress={handleSearchPress}
        onSidebarPress={openSidebar}
        onAboutPress={handleAboutPress}
      />
      
      <NotesList
        notes={filteredNotes}
        isSelectionMode={isSelectionMode}
        selectedNotes={selectedNotes}
        colors={colors}
        onNotePress={handleNotePress}
        onNoteLongPress={enterSelectionMode}
        onToggleNoteSelection={toggleNoteSelection}
        truncateContent={truncateContent}
      />
        <SelectionToolbar
        isVisible={isSelectionMode}
        toolbarAnimation={toolbarAnimation}
        selectedCount={selectedNotes.size}
        totalCount={filteredNotes.length}
        colors={colors}
        onExitSelection={exitSelectionMode}
        onToggleSelectAll={() => toggleSelectAll(filteredNotes)}
        onDeleteSelected={deleteSelectedNotes}
        onPinSelected={pinSelectedNotes}
        onUnpinSelected={unpinSelectedNotes}
        onExportSelected={exportSelectedNotes}
        onMoveSelected={handleMoveSelected}
        selectedNotes={selectedNotes}
        notes={notes}
      />
      
      <BatchExportDialog
        visible={showExportDialog}
        onClose={closeExportDialog}
        notes={selectedNotesData}
        selectedCount={selectedNotes.size}
      />      {/* 分类侧边栏 - 始终渲染以消除延迟 */}
      <CategorySidebar
        isVisible={sidebarVisible}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        notesCounts={notesCounts}
        onClose={closeSidebar}
        onCategorySelect={handleCategorySelect}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
      />{/* 分类管理模态框 */}
      <CategoryModal
        isVisible={categoryModalVisible}
        category={editingCategory}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
      />      {/* 移动笔记的分类选择器 */}
      <CategorySelectorModal
        visible={moveSelectorVisible}
        categories={categories}
        selectedCategoryId="all"
        onCategoryChange={handleMoveNotesToCategory}
        onClose={() => setMoveSelectorVisible(false)}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}      />
    </View>
  );
});

// 添加 displayName 以便于调试
NotesScreen.displayName = 'NotesScreen';

export default NotesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    paddingBottom: 0,
  },
});

