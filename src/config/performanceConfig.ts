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

// 性能优化最佳实践指南
export const PERFORMANCE_BEST_PRACTICES = {
  components: [
    '使用React.memo包装纯组件以避免不必要的重渲染',
    '使用useCallback缓存事件处理函数',
    '使用useMemo缓存昂贵的计算结果',
    '避免在render方法中创建新对象或函数',
    '使用稳定的key属性用于列表项',
    '合理使用shouldComponentUpdate或React.memo的第二个参数',
  ],
  
  lists: [
    '使用FlatList而不是ScrollView来渲染大列表',
    '实现getItemLayout以提高滚动性能',
    '设置合适的initialNumToRender和maxToRenderPerBatch',
    '启用removeClippedSubviews移除屏幕外视图',
    '使用optimized keyExtractor',
    '避免在renderItem中创建新函数',
  ],
  
  images: [
    '使用合适的图片格式和大小',
    '实现图片懒加载',
    '使用图片缓存策略',
    '压缩图片减少内存占用',
    '避免同时加载大量图片',
  ],
  
  animations: [
    '使用原生动画驱动（useNativeDriver: true）',
    '避免在动画过程中更新大量状态',
    '使用transform动画而不是layout动画',
    '合理设置动画持续时间',
    '避免复杂的动画嵌套',
  ],
  
  memory: [
    '及时清理定时器和事件监听器',
    '避免内存泄漏，正确使用useEffect的清理函数',
    '限制缓存大小',
    '定期清理不需要的数据',
    '监控内存使用情况',
  ],
  
  networking: [
    '实现请求缓存策略',
    '使用分页加载大量数据',
    '避免重复请求',
    '设置合理的超时时间',
    '实现重试机制',
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
    '✓ 组件使用React.memo优化',
    '✓ 事件处理函数使用useCallback',
    '✓ 昂贵计算使用useMemo',
    '✓ 避免匿名函数作为props',
    '✓ 使用稳定的key值',
  ],
  
  rendering: [
    '✓ 使用FlatList代替ScrollView',
    '✓ 实现getItemLayout优化',
    '✓ 启用removeClippedSubviews',
    '✓ 合理设置渲染批次大小',
    '✓ 优化图片加载和缓存',
  ],
  
  memory: [
    '✓ 清理定时器和监听器',
    '✓ 避免内存泄漏',
    '✓ 限制缓存大小',
    '✓ 监控内存使用',
    '✓ 定期垃圾回收',
  ],
  
  network: [
    '✓ 实现请求缓存',
    '✓ 避免重复请求',
    '✓ 使用分页加载',
    '✓ 设置请求超时',
    '✓ 实现错误重试',
  ],
  
  bundle: [
    '✓ 启用代码分割',
    '✓ 移除未使用代码',
    '✓ 压缩和混淆代码',
    '✓ 优化依赖包大小',
    '✓ 使用动态导入',
  ],
};

export default PERFORMANCE_CONFIG;
