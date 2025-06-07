import { Category } from '../types/category';

// 默认分类
export const DEFAULT_CATEGORIES: Category[] = [
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
