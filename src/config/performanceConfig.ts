// Performance配置 - React Native笔记应用性能优化策略配置
export const PERFORMANCE_CONFIG = {
  // React优化配置
  react: {
    // 是否启用React.memo
    enableMemo: true,
    // 是否启用useCallback优化
    enableUseCallback: true,
    // 是否启用useMemo优化
    enableUseMemo: true,
    // 是否启用React.lazy懒加载
    enableLazyLoading: true,
    // 是否启用Suspense
    enableSuspense: true,
  },

  // FlatList优化配置
  flatList: {
    // 初始渲染数量
    initialNumToRender: 10,
    // 最大渲染数量
    maxToRenderPerBatch: 5,
    // 更新单元格批处理周期
    updateCellsBatchingPeriod: 100,
    // 滚动事件节流
    scrollEventThrottle: 16,
    // 是否移除屏幕外视图
    removeClippedSubviews: true,
    // 窗口大小
    windowSize: 10,
    // 获取项目布局
    getItemLayout: true,
    // 键提取器优化
    keyExtractor: true,
  },

  // 图片优化配置
  image: {
    // 默认缓存策略
    cachePolicy: 'memory-disk',
    // 图片质量
    quality: 0.8,
    // 最大缓存大小 (MB)
    maxCacheSize: 100,
    // 图片压缩
    enableCompression: true,
    // 懒加载图片
    enableLazyLoading: true,
  },

  // 动画优化配置
  animation: {
    // 使用原生驱动
    useNativeDriver: true,
    // 动画持续时间
    defaultDuration: 300,
    // 缓动函数
    defaultEasing: 'ease-out',
    // 是否启用动画优化
    enableOptimizations: true,
  },

  // 内存管理配置
  memory: {
    // 自动垃圾回收阈值 (MB)
    gcThreshold: 50,
    // 最大缓存项目数量
    maxCacheItems: 1000,
    // 缓存过期时间 (分钟)
    cacheExpiration: 30,
    // 是否启用内存监控
    enableMonitoring: true,
  },

  // 网络优化配置
  network: {
    // 请求超时时间 (ms)
    timeout: 10000,
    // 最大并发请求数
    maxConcurrentRequests: 5,
    // 是否启用请求缓存
    enableCaching: true,
    // 缓存过期时间 (分钟)
    cacheExpiration: 15,
    // 重试次数
    maxRetries: 3,
  },

  // 数据库优化配置
  database: {
    // 批量操作大小
    batchSize: 100,
    // 事务超时时间 (ms)
    transactionTimeout: 5000,
    // 是否启用索引优化
    enableIndexing: true,
    // 是否启用压缩
    enableCompression: true,
  },

  // 调试和监控配置
  debugging: {
    // 是否启用性能监控
    enablePerformanceMonitoring: __DEV__,
    // 是否记录渲染时间
    logRenderTimes: __DEV__,
    // 是否记录内存使用
    logMemoryUsage: __DEV__,
    // 是否启用帧率监控
    enableFPSMonitoring: __DEV__,
    // 性能警告阈值 (ms)
    performanceWarningThreshold: 16,
  },

  // Bundle优化配置
  bundle: {
    // 是否启用代码分割
    enableCodeSplitting: true,
    // 是否启用Tree Shaking
    enableTreeShaking: true,
    // 是否压缩代码
    enableMinification: !__DEV__,
    // 是否生成Source Map
    generateSourceMaps: __DEV__,
  },
};

// Performance optimization best practices guide
export const PERFORMANCE_BEST_PRACTICES = {
  components: [
    'Use React.memo to wrap pure components to avoid unnecessary re-renders',
    'Use useCallback to cache event handlers',
    'Use useMemo to cache expensive computation results',
    'Avoid creating new objects or functions in render methods',
    'Use stable key props for list items',
    'Properly use shouldComponentUpdate or React.memo second parameter',
  ],
  
  lists: [
    'Use FlatList instead of ScrollView for rendering large lists',
    'Implement getItemLayout to improve scroll performance',
    'Set appropriate initialNumToRender and maxToRenderPerBatch',
    'Enable removeClippedSubviews to remove off-screen views',
    'Use optimized keyExtractor',
    'Avoid creating new functions in renderItem',
  ],
  
  images: [
    'Use appropriate image formats and sizes',
    'Implement image lazy loading',
    'Use image caching strategies',
    'Compress images to reduce memory usage',
    'Avoid loading many images simultaneously',
  ],
  
  animations: [
    'Use native animation driver (useNativeDriver: true)',
    'Avoid updating lots of state during animations',
    'Use transform animations instead of layout animations',
    'Set reasonable animation durations',
    'Avoid complex animation nesting',  ],
  
  memory: [
    'Clean up timers and event listeners promptly',
    'Avoid memory leaks, properly use useEffect cleanup functions',
    'Limit cache sizes',
    'Regularly clean up unnecessary data',
    'Monitor memory usage',  ],
  
  networking: [
    'Implement request caching strategies',
    'Use pagination for loading large datasets',
    'Avoid duplicate requests',
    'Set reasonable timeout values',
    'Implement retry mechanisms',
  ],
};

// 性能监控指标
export const PERFORMANCE_METRICS = {
  // 关键性能指标
  kpi: {
    // 首屏渲染时间 (ms)
    firstRenderTime: 1000,
    // 交互响应时间 (ms)
    interactionResponseTime: 100,
    // 列表滚动帧率 (fps)
    scrollFPS: 60,
    // 内存使用阈值 (MB)
    memoryUsageThreshold: 100,
    // Bundle大小阈值 (MB)
    bundleSizeThreshold: 10,
  },
  
  // 警告阈值
  warnings: {
    // 渲染时间警告阈值 (ms)
    renderTimeWarning: 16,
    // 内存使用警告阈值 (MB)
    memoryWarning: 80,
    // 低帧率警告阈值 (fps)
    lowFPSWarning: 50,
    // 慢查询警告阈值 (ms)
    slowQueryWarning: 1000,
  },
  
  // 优化目标
  targets: {
    // 目标首屏渲染时间 (ms)
    targetFirstRenderTime: 500,
    // 目标交互响应时间 (ms)
    targetInteractionTime: 50,
    // 目标内存使用 (MB)
    targetMemoryUsage: 50,
    // 目标Bundle大小 (MB)
    targetBundleSize: 5,
  },
};

// 性能优化检查清单
export const PERFORMANCE_CHECKLIST = {
  react: [
    '✓ Components optimized with React.memo',
    '✓ Event handlers use useCallback',
    '✓ Expensive computations use useMemo',
    '✓ Avoid anonymous functions as props',
    '✓ Use stable key values',
  ],
  
  rendering: [
    '✓ Use FlatList instead of ScrollView',
    '✓ Implement getItemLayout optimization',
    '✓ Enable removeClippedSubviews',
    '✓ Set reasonable render batch sizes',
    '✓ Optimize image loading and caching',
  ],
  
  memory: [
    '✓ Clean up timers and listeners',
    '✓ Avoid memory leaks',
    '✓ Limit cache sizes',
    '✓ Monitor memory usage',
    '✓ Regular garbage collection',
  ],
  
  network: [
    '✓ Implement request caching',
    '✓ Avoid duplicate requests',
    '✓ Use pagination loading',
    '✓ Set request timeouts',
    '✓ Implement error retry',
  ],
    bundle: [
    '✓ Enable code splitting',
    '✓ Remove unused code',
    '✓ Compress and minify code',
    '✓ Optimize dependency size',
    '✓ Use dynamic imports',
  ],
};

export default PERFORMANCE_CONFIG;
