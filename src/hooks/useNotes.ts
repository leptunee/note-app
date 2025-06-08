import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChunkedStorage, DataRecovery } from '../utils/storageUtils';
import { EmergencyDataCleanup } from '../utils/emergencyCleanup';

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

// 数据恢复实例
const dataRecovery = new DataRecovery();

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
  }, [lastRefreshTime]);  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 开始加载数据...');
        
        // 首先检查数据完整性
        const isDataIntact = await EmergencyDataCleanup.checkDataIntegrity();
        if (!isDataIntact) {
          console.log('⚠️ 检测到数据损坏，执行紧急清理...');
          await EmergencyDataCleanup.performCompleteReset();
        }
        
        // 使用新的存储系统加载笔记
        let notesData: string | null = null;
        try {
          notesData = await ChunkedStorage.getItem(NOTES_KEY);        } catch (error: any) {
          console.log('⚠️ 使用分块存储加载失败，尝试恢复数据:', error);
          
          // 如果是"Row too big"错误，执行紧急清理
          if (error?.message && error.message.includes('Row too big')) {
            console.log('🚨 检测到"Row too big"错误，执行紧急清理...');
            await EmergencyDataCleanup.performCompleteReset();
            notesData = null; // 清理后数据为空
          } else {
            // 尝试其他恢复方法
            const recoveredNotes = await DataRecovery.attemptRecovery(NOTES_KEY);
            if (recoveredNotes) {
              notesData = JSON.stringify(recoveredNotes);
            }
          }
        }
        
        if (notesData) {
          const parsedNotes = JSON.parse(notesData);
          console.log(`✅ 成功加载 ${parsedNotes.length} 条笔记`);
          
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
            console.log('🔄 迁移笔记分类并保存...');
            await ChunkedStorage.setItem(NOTES_KEY, migratedNotes);
          }
          
          setNotes(migratedNotes);
        } else {
          console.log('📝 没有找到笔记数据，使用空数组');
          setNotes([]);
        }

        // 使用新的存储系统加载分类
        let categoriesData: string | null = null;
        try {
          categoriesData = await ChunkedStorage.getItem(CATEGORIES_KEY);
        } catch (error) {
          console.log('⚠️ 使用分块存储加载分类失败，尝试恢复数据:', error);
          const recoveredCategories = await DataRecovery.attemptRecovery(CATEGORIES_KEY);
          if (recoveredCategories) {
            categoriesData = JSON.stringify(recoveredCategories);
          }
        }
        
        if (categoriesData) {
          const parsedCategories = JSON.parse(categoriesData);
          console.log(`✅ 成功加载 ${parsedCategories.length} 个自定义分类`);
            // 确保默认分类始终存在，并合并用户自定义分类
          const defaultCategoryIds = DEFAULT_CATEGORIES.map(cat => cat.id);
          const customCategories = parsedCategories.filter((cat: Category) => !defaultCategoryIds.includes(cat.id));
          const mergedCategories = [...DEFAULT_CATEGORIES, ...customCategories];
          setCategories(mergedCategories);
        } else {
          // 如果没有保存的分类，设置并保存默认分类
          console.log('📁 没有找到分类数据，使用默认分类');
          setCategories(DEFAULT_CATEGORIES);
          await ChunkedStorage.setItem(CATEGORIES_KEY, DEFAULT_CATEGORIES);
        }

        console.log('✅ 数据加载完成');
      } catch (error) {
        console.error('❌ 加载数据时发生错误:', error);
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
  }, [refreshTrigger]);  // 使用 useCallback 缓存保存函数
  const saveNotes = useCallback(async (newNotes: Note[]) => {
    console.log('💾 保存笔记:', newNotes.length);
    
    // 先创建备份
    if (notes.length > 0) {
      await DataRecovery.createBackup(NOTES_KEY, notes);
    }
    
    setNotes(newNotes);
    await ChunkedStorage.setItem(NOTES_KEY, newNotes);
    console.log('✅ 笔记保存完成');
  }, [notes]);

  // 使用 useMemo 缓存默认页面设置
  const defaultPageSettings = useMemo((): PageSettings => ({
    themeId: 'default', // 默认主题
    marginValue: 20, // 默认边距值 (例如，可以映射为中等边距)
    backgroundImageOpacity: 0.5, // 默认透明度设为50%
    backgroundImageBlur: 0, // 默认无模糊
    // 移除了默认背景图片
  }), []);

  const addNote = useCallback(async (note: Note) => {
    console.log('➕ 添加新笔记:', note.title);
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
    console.log('💾 保存分类:', newCategories.length);
    
    // 先创建备份
    if (categories.length > 0) {
      await DataRecovery.createBackup(CATEGORIES_KEY, categories);
    }
    
    setCategories(newCategories);
    // 只保存自定义分类到存储，默认分类不需要保存
    const customCategories = newCategories.filter(cat => !defaultCategoryIds.has(cat.id));
    console.log('💾 保存自定义分类数量:', customCategories.length);
    await ChunkedStorage.setItem(CATEGORIES_KEY, customCategories);
    console.log('✅ 分类保存完成');
  }, [defaultCategoryIds, categories]);

  const addCategory = useCallback(async (category: Category) => {
    console.log('➕ 添加新分类:', category.name);
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
