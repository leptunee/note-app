// Performance监控Hook - 用于实时监控React Native应用性能
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { 
  measureMemoryUsage, 
  FrameRateMonitor, 
  MemoryLeakDetector,
  getPerformanceMetrics 
} from '@/src/utils/performanceUtils';
import { PERFORMANCE_CONFIG } from '@/src/config/performanceConfig';

interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  fps: number;
  componentCount: number;
  appState: AppStateStatus;
  timestamp: number;
}

interface PerformanceAlert {
  type: 'memory' | 'render' | 'fps' | 'leak';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  value?: number;
}

export const usePerformanceMonitor = (options?: {
  enableMemoryMonitoring?: boolean;
  enableFPSMonitoring?: boolean;
  enableComponentTracking?: boolean;
  monitoringInterval?: number;
  alertThresholds?: {
    memory?: number;
    renderTime?: number;
    fps?: number;
  };
}) => {
  const {
    enableMemoryMonitoring = PERFORMANCE_CONFIG.debugging.enablePerformanceMonitoring,
    enableFPSMonitoring = PERFORMANCE_CONFIG.debugging.enableFPSMonitoring,
    enableComponentTracking = true,
    monitoringInterval = 5000, // 5秒监控间隔
    alertThresholds = {
      memory: 100 * 1024 * 1024, // 100MB
      renderTime: 16, // 16ms (60fps threshold)
      fps: 50, // 50fps minimum
    }
  } = options || {};

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
    const fpsMonitorRef = useRef<FrameRateMonitor | null>(null);
  const intervalRef = useRef<number | null>(null);
  const renderStartTimeRef = useRef<number>(0);

  // 创建性能警告
  const createAlert = useCallback((
    type: PerformanceAlert['type'],
    message: string,
    severity: PerformanceAlert['severity'],
    value?: number
  ) => {
    const alert: PerformanceAlert = {
      type,
      message,
      severity,
      timestamp: Date.now(),
      value,
    };
    
    setAlerts(prev => [...prev.slice(-9), alert]); // 保留最近10条警告
    
    if (__DEV__) {
      const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'log';
      console[logLevel](`[Performance Alert] ${message}`, value);
    }
  }, []);

  // 收集性能指标
  const collectMetrics = useCallback(async () => {
    if (!isMonitoring) return;

    try {
      const memoryUsage = enableMemoryMonitoring ? await measureMemoryUsage() : 0;
      const fps = enableFPSMonitoring && fpsMonitorRef.current 
        ? fpsMonitorRef.current.getCurrentFPS() 
        : 0;
      const componentCount = enableComponentTracking 
        ? Array.from(MemoryLeakDetector.getComponentCounts().values()).reduce((a, b) => a + b, 0)
        : 0;
      const renderTime = renderStartTimeRef.current > 0 
        ? performance.now() - renderStartTimeRef.current 
        : 0;

      const newMetrics: PerformanceMetrics = {
        memoryUsage,
        renderTime,
        fps,
        componentCount,
        appState: AppState.currentState,
        timestamp: Date.now(),
      };

      setMetrics(newMetrics);

      // 检查警告阈值
      if (enableMemoryMonitoring && memoryUsage > alertThresholds.memory!) {
        createAlert(
          'memory',
          `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
          memoryUsage > alertThresholds.memory! * 1.5 ? 'high' : 'medium',
          memoryUsage
        );
      }

      if (renderTime > alertThresholds.renderTime!) {
        createAlert(
          'render',
          `Slow render time: ${renderTime.toFixed(2)}ms`,
          renderTime > alertThresholds.renderTime! * 2 ? 'high' : 'medium',
          renderTime
        );
      }

      if (enableFPSMonitoring && fps > 0 && fps < alertThresholds.fps!) {
        createAlert(
          'fps',
          `Low FPS detected: ${fps}`,
          fps < alertThresholds.fps! * 0.7 ? 'high' : 'medium',
          fps
        );
      }

      if (enableComponentTracking && componentCount > 100) {
        createAlert(
          'leak',
          `High component count: ${componentCount}`,
          componentCount > 200 ? 'high' : 'medium',
          componentCount
        );
      }

    } catch (error) {
      if (__DEV__) {
        console.error('[Performance Monitor] Error collecting metrics:', error);
      }
    }
  }, [
    isMonitoring,
    enableMemoryMonitoring,
    enableFPSMonitoring,
    enableComponentTracking,
    alertThresholds,
    createAlert
  ]);

  // 开始监控
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setAlerts([]);

    // 启动FPS监控
    if (enableFPSMonitoring) {
      fpsMonitorRef.current = new FrameRateMonitor();
      fpsMonitorRef.current.start();
    }    // 启动定期指标收集
    intervalRef.current = setInterval(collectMetrics, monitoringInterval) as unknown as number;

    if (__DEV__) {
      console.log('[Performance Monitor] Monitoring started');
    }
  }, [isMonitoring, enableFPSMonitoring, collectMetrics, monitoringInterval]);

  // 停止监控
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);    // 停止FPS监控
    if (fpsMonitorRef.current) {
      fpsMonitorRef.current.stop();
      fpsMonitorRef.current = null;
    }

    // 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (__DEV__) {
      console.log('[Performance Monitor] Monitoring stopped');
    }
  }, [isMonitoring]);

  // 清除警告
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // 记录渲染开始时间
  const markRenderStart = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // 记录渲染结束时间
  const markRenderEnd = useCallback(() => {
    if (renderStartTimeRef.current > 0) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      renderStartTimeRef.current = 0;

      if (PERFORMANCE_CONFIG.debugging.logRenderTimes && renderTime > 16) {
        console.log(`[Render Performance] Render time: ${renderTime.toFixed(2)}ms`);
      }
    }
  }, []);

  // 获取性能报告
  const getPerformanceReport = useCallback(() => {
    return {
      currentMetrics: metrics,
      alerts: alerts,
      componentCounts: enableComponentTracking 
        ? Object.fromEntries(MemoryLeakDetector.getComponentCounts()) 
        : {},
      isMonitoring,
      recommendations: generateRecommendations(metrics, alerts),
    };
  }, [metrics, alerts, enableComponentTracking, isMonitoring]);

  // 生成性能优化建议
  const generateRecommendations = (
    currentMetrics: PerformanceMetrics | null,
    currentAlerts: PerformanceAlert[]
  ): string[] => {
    const recommendations: string[] = [];

    if (!currentMetrics) return recommendations;    // 内存相关建议
    if (currentMetrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Consider cleaning unnecessary cache data');
      recommendations.push('Check for memory leaks');
    }

    // 渲染性能建议
    if (currentMetrics.renderTime > 16) {
      recommendations.push('Optimize component rendering, use React.memo');
      recommendations.push('Reduce unnecessary re-renders');
    }

    // FPS相关建议
    if (currentMetrics.fps > 0 && currentMetrics.fps < 55) {
      recommendations.push('Optimize animations to use native driver');
      recommendations.push('Reduce complex UI operations');
    }

    // 组件数量建议
    if (currentMetrics.componentCount > 50) {
      recommendations.push('Consider using virtualized lists');
      recommendations.push('Unload unnecessary components promptly');
    }

    // 基于警告的建议
    const hasHighSeverityAlerts = currentAlerts.some(alert => alert.severity === 'high');
    if (hasHighSeverityAlerts) {
      recommendations.push('Handle high-priority performance issues immediately');
    }

    return recommendations;
  };

  // 应用状态监听
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        stopMonitoring();
      } else if (nextAppState === 'active' && PERFORMANCE_CONFIG.debugging.enablePerformanceMonitoring) {
        startMonitoring();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // 自动启动监控（如果启用）
  useEffect(() => {
    if (PERFORMANCE_CONFIG.debugging.enablePerformanceMonitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  return {
    // 监控状态
    isMonitoring,
    metrics,
    alerts,
    
    // 监控控制
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    
    // 渲染性能追踪
    markRenderStart,
    markRenderEnd,
    
    // 报告生成
    getPerformanceReport,
  };
};

// 性能监控HOC
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const MonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const { markRenderStart, markRenderEnd } = usePerformanceMonitor();

    React.useEffect(() => {
      markRenderStart();
      return markRenderEnd;
    });

    // 正确处理ref传递
    const componentProps = ref ? { ...props, ref } : props;
    return React.createElement(WrappedComponent, componentProps as any);
  });

  MonitoredComponent.displayName = `withPerformanceMonitor(${WrappedComponent.displayName || WrappedComponent.name})`;

  return MonitoredComponent;
};
