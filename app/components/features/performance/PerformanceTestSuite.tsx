// Performance测试组件 - 用于测量React Native笔记应用的性能指标
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { getPerformanceMetrics, measureRenderTime, measureMemoryUsage } from '@/src/utils/performanceUtils';

interface PerformanceTestResult {
  testName: string;
  renderTime: number;
  memoryUsage: number;
  timestamp: number;
  details?: any;
}

export const PerformanceTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const renderStartTime = useRef<number>(0);

  // 记录渲染开始时间
  useEffect(() => {
    renderStartTime.current = performance.now();
  }, []);

  // 测试组件渲染性能
  const testComponentRenderPerformance = useCallback(async () => {
    const testName = 'Component Render Performance';
    setCurrentTest(testName);
    
    const startTime = performance.now();
    
    // 模拟大量组件渲染
    for (let i = 0; i < 1000; i++) {
      // 触发虚拟渲染计算
      const element = React.createElement('div', { key: i });
    }
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const memoryUsage = await measureMemoryUsage();
    
    const result: PerformanceTestResult = {
      testName,
      renderTime,
      memoryUsage,
      timestamp: Date.now(),
      details: {
        iterations: 1000,
        avgRenderTimePerComponent: renderTime / 1000
      }
    };
    
    setTestResults(prev => [...prev, result]);
  }, []);

  // 测试列表滚动性能
  const testListScrollPerformance = useCallback(async () => {
    const testName = 'List Scroll Performance';
    setCurrentTest(testName);
    
    const startTime = performance.now();
    
    // 模拟大量数据处理
    const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      title: `Note ${i}`,
      content: `Content for note ${i}`.repeat(10),
      createdAt: Date.now() - i * 1000,
      updatedAt: Date.now() - i * 500,
    }));
    
    // 模拟数据过滤和排序操作
    const filteredData = largeDataSet
      .filter(item => item.id % 2 === 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 100);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const memoryUsage = await measureMemoryUsage();
    
    const result: PerformanceTestResult = {
      testName,
      renderTime,
      memoryUsage,
      timestamp: Date.now(),
      details: {
        originalDataSize: largeDataSet.length,
        filteredDataSize: filteredData.length,
        operationsPerformed: ['filter', 'sort', 'slice']
      }
    };
    
    setTestResults(prev => [...prev, result]);
  }, []);

  // 测试内存使用情况
  const testMemoryUsage = useCallback(async () => {
    const testName = 'Memory Usage Test';
    setCurrentTest(testName);
    
    const startTime = performance.now();
    
    // 创建大量对象来测试内存使用
    const memoryTestData = [];
    for (let i = 0; i < 50000; i++) {
      memoryTestData.push({
        id: i,
        data: new Array(100).fill(Math.random()),
        timestamp: Date.now(),
      });
    }
    
    const memoryUsage = await measureMemoryUsage();
    const endTime = performance.now();
    
    // 清理测试数据
    memoryTestData.length = 0;
    
    const result: PerformanceTestResult = {
      testName,
      renderTime: endTime - startTime,
      memoryUsage,
      timestamp: Date.now(),
      details: {
        objectsCreated: 50000,
        arraySize: 100,
        memoryPeak: memoryUsage
      }
    };
    
    setTestResults(prev => [...prev, result]);
  }, []);

  // 测试React组件优化效果
  const testReactOptimizations = useCallback(async () => {
    const testName = 'React Optimizations Test';
    setCurrentTest(testName);
    
    const startTime = performance.now();
    
    // 模拟有无memo优化的对比
    let rerenderCount = 0;
    
    // 模拟props变化导致的重渲染
    for (let i = 0; i < 1000; i++) {
      const props = { id: i, data: { value: Math.random() } };
      // 模拟memo检查
      if (i > 0) {
        const prevProps = { id: i - 1, data: { value: Math.random() } };
        if (props.id !== prevProps.id) {
          rerenderCount++;
        }
      }
    }
    
    const endTime = performance.now();
    const memoryUsage = await measureMemoryUsage();
    
    const result: PerformanceTestResult = {
      testName,
      renderTime: endTime - startTime,
      memoryUsage,
      timestamp: Date.now(),
      details: {
        totalPropChanges: 1000,
        actualRerenders: rerenderCount,
        optimizationEfficiency: ((1000 - rerenderCount) / 1000 * 100).toFixed(2) + '%'
      }
    };
    
    setTestResults(prev => [...prev, result]);
  }, []);

  // 运行所有测试
  const runAllTests = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      await testComponentRenderPerformance();
      await new Promise(resolve => setTimeout(resolve, 500)); // 间隔500ms
      
      await testListScrollPerformance();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testMemoryUsage();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await testReactOptimizations();
      
      Alert.alert('测试完成', '所有性能测试已完成，请查看结果。');
    } catch (error) {
      Alert.alert('测试错误', `测试过程中发生错误: ${error}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  }, [isRunning, testComponentRenderPerformance, testListScrollPerformance, testMemoryUsage, testReactOptimizations]);

  // 清除测试结果
  const clearResults = useCallback(() => {
    setTestResults([]);
  }, []);

  // 格式化测试结果
  const formatResult = (result: PerformanceTestResult) => {
    return {
      ...result,
      formattedRenderTime: `${result.renderTime.toFixed(2)}ms`,
      formattedMemoryUsage: `${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      formattedTimestamp: new Date(result.timestamp).toLocaleTimeString(),
    };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>性能测试套件</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '测试中...' : '运行所有测试'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>清除结果</Text>
        </TouchableOpacity>
      </View>
      
      {currentTest && (
        <Text style={styles.currentTest}>当前测试: {currentTest}</Text>
      )}
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map((result, index) => {
          const formatted = formatResult(result);
          return (
            <View key={index} style={styles.resultCard}>
              <Text style={styles.resultTitle}>{result.testName}</Text>
              <Text style={styles.resultDetail}>
                渲染时间: {formatted.formattedRenderTime}
              </Text>
              <Text style={styles.resultDetail}>
                内存使用: {formatted.formattedMemoryUsage}
              </Text>
              <Text style={styles.resultDetail}>
                时间: {formatted.formattedTimestamp}
              </Text>
              {result.details && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>详细信息:</Text>
                  {Object.entries(result.details).map(([key, value], detailIndex) => (
                    <Text key={detailIndex} style={styles.detailText}>
                      {key}: {JSON.stringify(value)}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentTest: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  detailText: {
    fontSize: 12,
    marginBottom: 2,
    color: '#666',
    marginLeft: 8,
  },
});
