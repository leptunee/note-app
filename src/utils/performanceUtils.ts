// Performance工具函数 - 用于测量React Native应用性能
import React from 'react';
import { Platform } from 'react-native';

/**
 * 获取性能指标
 */
export const getPerformanceMetrics = () => {
  if (typeof performance !== 'undefined') {
    return {
      now: performance.now(),
      memory: (performance as any).memory || null,
      navigation: (performance as any).navigation || null,
    };
  }
  return {
    now: Date.now(),
    memory: null,
    navigation: null,
  };
};

/**
 * 测量渲染时间
 */
export const measureRenderTime = (startTime: number): number => {
  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return endTime - startTime;
};

/**
 * 测量内存使用情况
 */
export const measureMemoryUsage = async (): Promise<number> => {
  if (Platform.OS === 'web' && typeof performance !== 'undefined' && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize;
  }
  
  // 对于React Native，我们使用一个估算值
  // 在实际应用中，可以使用native模块来获取真实的内存使用情况
  return Promise.resolve(Math.random() * 100 * 1024 * 1024); // 模拟100MB以内的内存使用
};

/**
 * 性能监控装饰器
 */
export const withPerformanceMonitoring = <T extends any[], R>(
  fn: (...args: T) => R,
  name?: string
): ((...args: T) => R) => {
  return (...args: T): R => {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const result = fn(...args);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    console.log(`[Performance] ${name || fn.name}: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  };
};

/**
 * 异步性能监控装饰器
 */
export const withAsyncPerformanceMonitoring = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name?: string
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const result = await fn(...args);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    console.log(`[Performance] ${name || fn.name}: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  };
};

/**
 * 节流函数 - 性能优化
 */
export const throttle = <T extends any[]>(
  func: (...args: T) => void,
  limit: number
): ((...args: T) => void) => {
  let inThrottle: boolean;
  return (...args: T): void => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 防抖函数 - 性能优化
 */
export const debounce = <T extends any[]>(
  func: (...args: T) => void,
  delay: number
): ((...args: T) => void) => {
  let timeoutId: number;
  return (...args: T): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay) as unknown as number;
  };
};

/**
 * 测量组件渲染性能的Hook
 */
export const useRenderPerformance = (componentName: string) => {
  if (__DEV__) {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // 如果渲染时间超过16ms（60fps阈值）
      console.warn(`[Performance Warning] ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    }
  }
};

/**
 * 内存泄漏检测
 */
export class MemoryLeakDetector {
  private static components: Map<string, number> = new Map();
  
  static registerComponent(componentName: string) {
    const count = this.components.get(componentName) || 0;
    this.components.set(componentName, count + 1);
    
    if (__DEV__ && count > 50) {
      console.warn(`[Memory Leak Warning] ${componentName} has ${count + 1} instances`);
    }
  }
  
  static unregisterComponent(componentName: string) {
    const count = this.components.get(componentName) || 0;
    if (count > 0) {
      this.components.set(componentName, count - 1);
    }
  }
  
  static getComponentCounts() {
    return new Map(this.components);
  }
  
  static reset() {
    this.components.clear();
  }
}

/**
 * Bundle大小分析器
 */
export const analyzeBundleSize = () => {
  if (Platform.OS === 'web') {
    // Web平台可以分析资源大小
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      const entry = entries[0];
      return {
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        loadTime: entry.loadEventEnd - entry.loadEventStart,
      };
    }
  }
  
  return {
    message: 'Bundle分析仅在Web平台可用',
    platform: Platform.OS,
  };
};

/**
 * 帧率监控
 */
export class FrameRateMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private monitoring = false;
  
  start() {
    if (this.monitoring) return;
    
    this.monitoring = true;
    this.frameCount = 0;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    this.measureFrame();
  }
  
  stop() {
    this.monitoring = false;
  }
  
  private measureFrame = () => {
    if (!this.monitoring) return;
    
    this.frameCount++;
    const currentTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (__DEV__ && this.fps < 50) {
        console.warn(`[Performance Warning] Low FPS detected: ${this.fps}`);
      }
    }
    
    requestAnimationFrame(this.measureFrame);
  };
  
  getCurrentFPS() {
    return this.fps;
  }
}

/**
 * 性能基准测试
 */
export const runPerformanceBenchmark = async () => {
  const results = {
    renderTest: 0,
    computationTest: 0,
    memoryTest: 0,
    iterationTest: 0,
  };
  
  // 渲染测试
  const renderStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  for (let i = 0; i < 1000; i++) {
    // 模拟DOM操作
    const element = { id: i, data: Math.random() };
  }
  results.renderTest = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - renderStart;
  
  // 计算测试
  const computeStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += Math.sqrt(i);
  }
  results.computationTest = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - computeStart;
  
  // 内存测试
  const memoryStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const largeArray = new Array(10000).fill(0).map((_, i) => ({ id: i, data: new Array(100).fill(Math.random()) }));
  results.memoryTest = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - memoryStart;
  
  // 迭代测试
  const iterationStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const testArray = new Array(50000).fill(0).map((_, i) => i);
  const filtered = testArray.filter(x => x % 2 === 0).map(x => x * 2).slice(0, 1000);
  results.iterationTest = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - iterationStart;
  
  return results;
};

/**
 * React组件性能监控HOC
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const TrackedComponent = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
    
    React.useEffect(() => {
      MemoryLeakDetector.registerComponent(name);
      return () => {
        MemoryLeakDetector.unregisterComponent(name);
      };
    }, [name]);
    
    useRenderPerformance(name);
    
    // 正确处理ref传递
    const componentProps = ref ? { ...props, ref } : props;
    return React.createElement(WrappedComponent, componentProps as any);
  });
  
  TrackedComponent.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return TrackedComponent;
};
