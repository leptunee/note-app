// Performance工具函数 - 用于测量React Native应用性能
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
