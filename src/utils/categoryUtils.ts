// 本地化的分类工具函数
import { Category } from '../types/category';
import i18n from '../../i18n';

// 获取默认分类（本地化）
export const getDefaultCategories = (): Category[] => [
  {
    id: 'all',
    name: i18n.t('allNotes'),
    icon: 'file-text',
    color: '#2196F3',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'uncategorized', 
    name: i18n.t('uncategorized'),
    icon: 'folder',
    color: '#9E9E9E',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// 获取特定分类的本地化名称
export const getLocalizedCategoryName = (categoryId: string): string => {
  switch (categoryId) {
    case 'all':
      return i18n.t('allNotes');
    case 'uncategorized':
      return i18n.t('uncategorized');
    default:
      return '';
  }
};
