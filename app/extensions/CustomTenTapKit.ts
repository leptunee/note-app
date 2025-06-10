// 自定义TenTap编辑器配置，支持国际化占位符
import { TenTapStarterKit } from '@10play/tentap-editor';
import { useTranslation } from 'react-i18next';

// 创建自定义编辑器配置
export const createCustomTenTapKit = (placeholderText: string = 'Write something...') => {
  return [
    ...TenTapStarterKit,
    // 可以在这里添加自定义扩展来覆盖占位符
    // 目前TenTap编辑器的占位符配置比较复杂，我们通过其他方式处理
  ];
};

// Hook来获取本地化的编辑器配置
export const useLocalizedTenTapKit = () => {
  const { t } = useTranslation();
  
  // 返回配置好的编辑器扩展
  return createCustomTenTapKit(t('writeSomething'));
};
