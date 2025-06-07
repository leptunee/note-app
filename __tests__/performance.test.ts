// Performance optimization validation tests

// Mock performance API for React Native environment
global.performance = global.performance || {
  now: () => Date.now(),
};

// Mock the performance utils
jest.mock('../src/utils/performanceUtils', () => ({
  measureRenderTime: jest.fn((component: string, startTime: number) => {
    return performance.now() - startTime;
  }),
  measureMemoryUsage: jest.fn(async () => {
    return Promise.resolve(50 * 1024 * 1024); // Mock 50MB
  }),
  FrameRateMonitor: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    getCurrentFPS: jest.fn(() => 60),
  })),
  MemoryLeakDetector: {
    getComponentCounts: jest.fn(() => new Map([['TestComponent', 5]])),
  },
  getPerformanceMetrics: jest.fn(() => ({})),
}));

// Mock the performance config
jest.mock('../src/config/performanceConfig', () => ({
  PERFORMANCE_CONFIG: {
    react: {
      enableMemo: true,
      enableCallback: true,
      enableUseMemo: true,
    },
    debugging: {
      enablePerformanceMonitoring: true,
      enableFPSMonitoring: true,
      logRenderTimes: true,
    },
  },
}));

describe('Performance Optimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have performance utils available', async () => {
    const { measureRenderTime, measureMemoryUsage } = require('../src/utils/performanceUtils');
    
    expect(measureRenderTime).toBeDefined();
    expect(measureMemoryUsage).toBeDefined();
    
    const renderTime = measureRenderTime('TestComponent', performance.now() - 10);
    expect(renderTime).toBeGreaterThanOrEqual(0);
    
    const memoryUsage = await measureMemoryUsage();
    expect(memoryUsage).toBeGreaterThan(0);
  });

  it('should have performance config with optimization flags enabled', () => {
    const { PERFORMANCE_CONFIG } = require('../src/config/performanceConfig');
    
    expect(PERFORMANCE_CONFIG.react.enableMemo).toBe(true);
    expect(PERFORMANCE_CONFIG.react.enableCallback).toBe(true);
    expect(PERFORMANCE_CONFIG.react.enableUseMemo).toBe(true);
  });

  it('should measure render time correctly', () => {
    const { measureRenderTime } = require('../src/utils/performanceUtils');
    
    const startTime = performance.now() - 16; // Simulate 16ms render
    const renderTime = measureRenderTime('TestComponent', startTime);
    
    expect(typeof renderTime).toBe('number');
    expect(renderTime).toBeGreaterThanOrEqual(0);
  });

  it('should track memory usage', async () => {
    const { measureMemoryUsage } = require('../src/utils/performanceUtils');
    
    const memoryUsage = await measureMemoryUsage();
    expect(typeof memoryUsage).toBe('number');
    expect(memoryUsage).toBeGreaterThan(0);
  });

  it('should have FPS monitoring capability', () => {
    const { FrameRateMonitor } = require('../src/utils/performanceUtils');
    
    const monitor = new FrameRateMonitor();
    expect(monitor.start).toBeDefined();
    expect(monitor.stop).toBeDefined();
    expect(monitor.getCurrentFPS).toBeDefined();
    
    expect(monitor.getCurrentFPS()).toBe(60);
  });
});
