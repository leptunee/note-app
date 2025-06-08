// 懒加载组件定义
import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

// 创建统一的加载指示器组件
const LoadingFallback = ({ colorScheme = 'light' }: { colorScheme?: 'light' | 'dark' }) => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'
  }}>
    <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
  </View>
);

// 懒加载的模态组件
const LazyCategoryModal = lazy(() => 
  import('./features/categories/CategoryModal').then(module => ({ default: module.CategoryModal }))
);

const LazyCategorySelectorModal = lazy(() => 
  import('./features/categories/CategorySelectorModal').then(module => ({ default: module.CategorySelectorModal }))
);

const LazyBatchExportDialog = lazy(() => 
  import('./features/export/BatchExportDialog').then(module => ({ default: module.BatchExportDialog }))
);

const LazyPageSettingsModal = lazy(() => 
  import('./features/settings/PageSettingsModal').then(module => ({ default: module.PageSettingsModal }))
);

const LazyExportModal = lazy(() => 
  import('./features/export/ExportModal').then(module => ({ default: module.ExportModal }))
);

// 带 Suspense 的包装器组件
export const CategoryModal = (props: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Suspense fallback={<LoadingFallback colorScheme={colorScheme} />}>
      <LazyCategoryModal {...props} />
    </Suspense>
  );
};

export const CategorySelectorModal = (props: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Suspense fallback={<LoadingFallback colorScheme={colorScheme} />}>
      <LazyCategorySelectorModal {...props} />
    </Suspense>
  );
};

export const BatchExportDialog = (props: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Suspense fallback={<LoadingFallback colorScheme={colorScheme} />}>
      <LazyBatchExportDialog {...props} />
    </Suspense>
  );
};

export const PageSettingsModal = (props: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Suspense fallback={<LoadingFallback colorScheme={colorScheme} />}>
      <LazyPageSettingsModal {...props} />
    </Suspense>
  );
};

export const ExportModal = (props: any) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <Suspense fallback={<LoadingFallback colorScheme={colorScheme} />}>
      <LazyExportModal {...props} />
    </Suspense>
  );
};
