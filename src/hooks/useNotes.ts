import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number; // 添加最后编辑时间
  pinned?: boolean; // 添加置顶标记
  pageSettings?: PageSettings; // 新增页面设置字段
  categoryId?: string; // 添加分类ID字段
};

// 新增分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

// 新增页面设置类型
export interface PageSettings {
  themeId: string;
  backgroundImageUri?: string;
  backgroundImageOpacity: number; // 修改为必须属性
  backgroundImageFilter?: string; // 新增背景滤镜选项
  backgroundImageBlur?: number; // 新增背景模糊选项
  marginValue: number; // 用于滑块，例如 0-100，具体数值代表的边距在组件中转换
}

const NOTES_KEY = 'NOTES';
const CATEGORIES_KEY = 'CATEGORIES';

// 默认分类
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: '全部笔记',
    icon: 'file-text',
    color: '#2196F3',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'uncategorized',
    name: '未分类',
    icon: 'folder',
    color: '#9E9E9E',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'work',
    name: '工作',
    icon: 'briefcase',
    color: '#FF9800',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'personal',
    name: '个人',
    icon: 'user',
    color: '#4CAF50',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'study',
    name: '学习',
    icon: 'graduation-cap',
    color: '#9C27B0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // 缓存默认分类 ID 集合，避免重复计算
  const defaultCategoryIds = useMemo(() => 
    new Set(DEFAULT_CATEGORIES.map(cat => cat.id)), 
    []
  );

  // 使用 useCallback 优化刷新笔记列表的函数，添加防抖动处理
  const refreshNotes = useCallback(() => {
    const now = Date.now();
    // 如果距离上次刷新不足500毫秒，则忽略此次刷新请求
    if (now - lastRefreshTime < 500) return;
    
    setLastRefreshTime(now);
    setRefreshTrigger(prev => prev + 1);
  }, [lastRefreshTime]);useEffect(() => {
    const loadData = async () => {
      try {
        // 加载笔记
        const notesData = await AsyncStorage.getItem(NOTES_KEY);
        if (notesData) {
          const parsedNotes = JSON.parse(notesData);
          
          // 迁移所有笔记到"未分类"分类
          const migratedNotes = parsedNotes.map((note: Note) => ({
            ...note,
            categoryId: note.categoryId && note.categoryId !== 'all' ? note.categoryId : 'uncategorized'
          }));
          
          // 如果有笔记被迁移，保存更新后的数据
          const hasChanges = migratedNotes.some((note: Note, index: number) => 
            note.categoryId !== parsedNotes[index].categoryId
          );
            if (hasChanges) {
            await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(migratedNotes));
          }
          
          setNotes(migratedNotes);
        }        // 加载分类
        const categoriesData = await AsyncStorage.getItem(CATEGORIES_KEY);
        if (categoriesData) {
          const parsedCategories = JSON.parse(categoriesData);
          // 确保默认分类始终存在，并合并用户自定义分类
          const defaultCategoryIds = DEFAULT_CATEGORIES.map(cat => cat.id);          const customCategories = parsedCategories.filter((cat: Category) => !defaultCategoryIds.includes(cat.id));
          const mergedCategories = [...DEFAULT_CATEGORIES, ...customCategories];
          setCategories(mergedCategories);
        } else {          // 如果没有保存的分类，设置并保存默认分类
          setCategories(DEFAULT_CATEGORIES);
          await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        }      } catch (error) {
        // 如果加载失败，尝试重新加载一次
        setTimeout(async () => {
          try {
            const notesData = await AsyncStorage.getItem(NOTES_KEY);
            if (notesData) {
              const parsedNotes = JSON.parse(notesData);
              setNotes(parsedNotes);
            }            const categoriesData = await AsyncStorage.getItem(CATEGORIES_KEY);
            if (categoriesData) {
              const parsedCategories = JSON.parse(categoriesData);
              // 确保默认分类始终存在，并合并用户自定义分类
              const defaultCategoryIds = DEFAULT_CATEGORIES.map(cat => cat.id);
              const customCategories = parsedCategories.filter((cat: Category) => !defaultCategoryIds.includes(cat.id));
              const mergedCategories = [...DEFAULT_CATEGORIES, ...customCategories];
              setCategories(mergedCategories);
            } else {
              setCategories(DEFAULT_CATEGORIES);
              await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
            }          } catch (retryError) {
            // Retry loading data failed
          }
        }, 1000);
      } finally {
        setLoading(false);
      }
    };    loadData();
  }, [refreshTrigger]);
  // 使用 useCallback 缓存保存函数
  const saveNotes = useCallback(async (newNotes: Note[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  }, []);

  // 使用 useMemo 缓存默认页面设置
  const defaultPageSettings = useMemo((): PageSettings => ({
    themeId: 'default', // 默认主题
    marginValue: 20, // 默认边距值 (例如，可以映射为中等边距)
    backgroundImageOpacity: 0.5, // 默认透明度设为50%
    backgroundImageBlur: 0, // 默认无模糊
    // 移除了默认背景图片
  }), []);

  const addNote = useCallback(async (note: Note) => {
    const noteWithDefaults = {
      ...note,
      pageSettings: note.pageSettings || defaultPageSettings,
    };
    const newNotes = [noteWithDefaults, ...notes];
    await saveNotes(newNotes);
  }, [notes, saveNotes, defaultPageSettings]);

  const updateNote = useCallback(async (note: Note) => {
    const newNotes = notes.map(n => (n.id === note.id ? { ...n, ...note } : n));
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  const deleteNote = useCallback(async (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  // 批量删除笔记 - 使用 useCallback 优化
  const deleteNotes = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    const newNotes = notes.filter(n => !idSet.has(n.id));
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  const togglePinNote = useCallback(async (id: string) => {
    const newNotes = notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

    // 批量设置置顶状态，避免多次刷新 - 使用 useCallback 优化
  const setPinNotes = useCallback(async (ids: string[], pinned: boolean) => {
    const idSet = new Set(ids);
    const newNotes = notes.map(n => 
      idSet.has(n.id) ? { ...n, pinned } : n
    );
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  // 分类管理函数 - 使用 useCallback 优化
  const saveCategories = useCallback(async (newCategories: Category[]) => {
    setCategories(newCategories);
    // 只保存自定义分类到存储，默认分类不需要保存
    const customCategories = newCategories.filter(cat => !defaultCategoryIds.has(cat.id));
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
  }, [defaultCategoryIds]);

  const addCategory = useCallback(async (category: Category) => {
    const newCategories = [...categories, category];
    await saveCategories(newCategories);
  }, [categories, saveCategories]);

  const updateCategory = useCallback(async (category: Category) => {
    const newCategories = categories.map(c => (c.id === category.id ? { ...c, ...category } : c));
    await saveCategories(newCategories);
  }, [categories, saveCategories]);
  const deleteCategory = useCallback(async (id: string) => {
    // 不允许删除系统分类
    if (id === 'all' || id === 'uncategorized') return;
    
    // 将该分类下的笔记移到"未分类"分类
    const newNotes = notes.map(n => 
      n.categoryId === id ? { ...n, categoryId: 'uncategorized' } : n
    );
    await saveNotes(newNotes);
    
    // 删除分类
    const newCategories = categories.filter(c => c.id !== id);
    await saveCategories(newCategories);
  }, [notes, categories, saveNotes, saveCategories]);

  // 批量更新笔记分类，避免竞态条件
  const updateMultipleNoteCategories = useCallback(async (noteIds: string[], categoryId: string) => {
    const noteIdSet = new Set(noteIds);
    const newNotes = notes.map(n => 
      noteIdSet.has(n.id) ? { ...n, categoryId } : n
    );
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  const updateNoteCategory = useCallback(async (noteId: string, categoryId: string) => {
    const newNotes = notes.map(n => 
      n.id === noteId ? { ...n, categoryId } : n
    );
    await saveNotes(newNotes);
  }, [notes, saveNotes]);

  // 使用 useCallback 和 useMemo 优化分类筛选功能  // 使用 useCallback 和 useMemo 优化分类筛选功能
  const getNotesByCategory = useCallback((categoryId: string) => {
    if (categoryId === 'all') {
      return notes;
    }
    if (categoryId === 'uncategorized') {
      return notes.filter(note => !note.categoryId || note.categoryId === 'uncategorized');
    }
    return notes.filter(note => note.categoryId === categoryId);
  }, [notes]);
  
  return { 
    notes, 
    categories,
    loading, 
    addNote, 
    updateNote, 
    deleteNote, 
    deleteNotes, 
    togglePinNote, 
    setPinNotes, 
    refreshNotes,
    addCategory,
    updateCategory,
    deleteCategory,
    updateNoteCategory,
    updateMultipleNoteCategories,
    getNotesByCategory
  };
}
