import { Category } from '../types/category';

// 默认分类
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'allNotes', // 将在显示时通过翻译系统转换
    icon: 'file-text',
    color: '#2196F3',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'uncategorized',
    name: 'uncategorized', // 将在显示时通过翻译系统转换
    icon: 'folder',
    color: '#9E9E9E',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'work',
    name: 'work', // 将在显示时通过翻译系统转换
    icon: 'briefcase',
    color: '#FF9800',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'personal',
    name: 'personal', // 将在显示时通过翻译系统转换
    icon: 'user',
    color: '#4CAF50',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'study',
    name: 'study', // 将在显示时通过翻译系统转换
    icon: 'graduation-cap',
    color: '#9C27B0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
