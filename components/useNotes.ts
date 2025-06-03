import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number; // 添加最后编辑时间
  pinned?: boolean; // 添加置顶标记
  pageSettings?: PageSettings; // 新增页面设置字段
};

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

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // 刷新笔记列表的函数，添加防抖动处理
  const refreshNotes = () => {
    const now = Date.now();
    // 如果距离上次刷新不足500毫秒，则忽略此次刷新请求
    if (now - lastRefreshTime < 500) return;
    
    setLastRefreshTime(now);
    setRefreshTrigger(prev => prev + 1);
  };  useEffect(() => {
    const loadNotes = async () => {
      try {
        const data = await AsyncStorage.getItem(NOTES_KEY);
        if (data) {
          const parsedNotes = JSON.parse(data);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('❌ Error loading notes:', error);
        // 如果加载失败，尝试重新加载一次
        setTimeout(async () => {
          try {
            const data = await AsyncStorage.getItem(NOTES_KEY);
            if (data) {
              const parsedNotes = JSON.parse(data);
              setNotes(parsedNotes);
            }
          } catch (retryError) {
            console.error('❌ Retry loading notes failed:', retryError);
          }
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [refreshTrigger]);const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  };  const addNote = async (note: Note) => {
    const defaultPageSettings: PageSettings = {
      themeId: 'default', // 默认主题
      marginValue: 20, // 默认边距值 (例如，可以映射为中等边距)
      backgroundImageOpacity: 0.5, // 默认透明度设为50%
      backgroundImageBlur: 0, // 默认无模糊
      // 移除了默认背景图片
    };
    const noteWithDefaults = {
      ...note,
      pageSettings: note.pageSettings || defaultPageSettings,
    };
    const newNotes = [noteWithDefaults, ...notes];
    await saveNotes(newNotes);
  };

  const updateNote = async (note: Note) => {
    const newNotes = notes.map(n => (n.id === note.id ? { ...n, ...note } : n));
    await saveNotes(newNotes);
  };
  const deleteNote = async (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    await saveNotes(newNotes);
  };
  const togglePinNote = async (id: string) => {
    const newNotes = notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    await saveNotes(newNotes);
  };

  // 批量设置置顶状态，避免多次刷新
  const setPinNotes = async (ids: string[], pinned: boolean) => {
    const idSet = new Set(ids);
    const newNotes = notes.map(n => 
      idSet.has(n.id) ? { ...n, pinned } : n
    );
    await saveNotes(newNotes);
  };

  // 移除清理所有数据的功能
  return { notes, loading, addNote, updateNote, deleteNote, togglePinNote, setPinNotes, refreshNotes };
}
