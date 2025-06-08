// Performance报告组件 - 显示React Native应用的性能状态和建议
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Modal,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePerformanceMonitor } from '@/src/hooks/usePerformanceMonitor';
import { runPerformanceBenchmark } from '@/src/utils/performanceUtils';
import Colors from '@/constants/Colors';

interface PerformanceReportProps {
  visible: boolean;
  onClose: () => void;
}

export const PerformanceReport: React.FC<PerformanceReportProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  const {
    isMonitoring,
    metrics,
    alerts,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    getPerformanceReport,
  } = usePerformanceMonitor();

  // 缓存颜色配置
  const colors = useMemo(() => ({
    background: Colors[colorScheme].background,
    cardBackground: colorScheme === 'dark' ? '#222' : '#f9f9f9',
    text: Colors[colorScheme].text,
    secondaryText: colorScheme === 'dark' ? '#ccc' : '#666',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    primary: Colors[colorScheme].tint,
  }), [colorScheme]);

  // 运行基准测试
  const handleRunBenchmark = useCallback(async () => {
    if (isRunningBenchmark) return;

    setIsRunningBenchmark(true);
    try {
      const results = await runPerformanceBenchmark();
      setBenchmarkResults(results);
      Alert.alert('基准测试完成', '测试结果已更新');
    } catch (error) {
      Alert.alert('测试失败', `基准测试过程中发生错误: ${error}`);
    } finally {
      setIsRunningBenchmark(false);
    }
  }, [isRunningBenchmark]);

  // 获取性能等级
  const getPerformanceGrade = useCallback((metrics: any) => {
    if (!metrics) return { grade: 'N/A', color: colors.secondaryText };

    let score = 100;
    
    // 内存使用评分（权重30%）
    const memoryMB = metrics.memoryUsage / 1024 / 1024;
    if (memoryMB > 100) score -= 30;
    else if (memoryMB > 50) score -= 15;

    // 渲染时间评分（权重40%）
    if (metrics.renderTime > 32) score -= 40;
    else if (metrics.renderTime > 16) score -= 20;

    // FPS评分（权重30%）
    if (metrics.fps > 0) {
      if (metrics.fps < 30) score -= 30;
      else if (metrics.fps < 50) score -= 15;
    }

    if (score >= 90) return { grade: 'A', color: colors.success };
    if (score >= 80) return { grade: 'B', color: colors.primary };
    if (score >= 70) return { grade: 'C', color: colors.warning };
    return { grade: 'D', color: colors.error };
  }, [colors]);

  // 格式化数值
  const formatMetric = useCallback((value: number, unit: string) => {
    if (unit === 'MB') {
      return `${(value / 1024 / 1024).toFixed(2)} ${unit}`;
    }
    if (unit === 'ms') {
      return `${value.toFixed(2)} ${unit}`;
    }
    return `${Math.round(value)} ${unit}`;
  }, []);

  // 获取警告图标
  const getAlertIcon = useCallback((severity: string) => {
    switch (severity) {
      case 'high': return 'exclamation-triangle';
      case 'medium': return 'exclamation-circle';
      default: return 'info-circle';
    }
  }, []);

  // 获取警告颜色
  const getAlertColor = useCallback((severity: string) => {
    switch (severity) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.primary;
    }
  }, [colors]);

  const performanceGrade = getPerformanceGrade(metrics);
  const report = getPerformanceReport();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* 标题栏 */}
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            性能报告
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 监控状态 */}
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>监控状态</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: isMonitoring ? colors.success : colors.secondaryText }
              ]} />
            </View>
            <Text style={[styles.cardContent, { color: colors.secondaryText }]}>
              {isMonitoring ? '监控运行中' : '监控已停止'}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={isMonitoring ? stopMonitoring : startMonitoring}
              >
                <Text style={styles.buttonText}>
                  {isMonitoring ? '停止监控' : '开始监控'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
                onPress={clearAlerts}
              >
                <Text style={[styles.buttonText, { color: colors.primary }]}>
                  清除警告
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 性能评级 */}
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>性能评级</Text>
            <View style={styles.gradeContainer}>
              <Text style={[styles.grade, { color: performanceGrade.color }]}>
                {performanceGrade.grade}
              </Text>
              <Text style={[styles.gradeLabel, { color: colors.secondaryText }]}>
                综合评分
              </Text>
            </View>
          </View>

          {/* 当前指标 */}
          {metrics && (
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>当前指标</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {formatMetric(metrics.memoryUsage, 'MB')}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
                    内存使用
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {formatMetric(metrics.renderTime, 'ms')}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
                    渲染时间
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {metrics.fps > 0 ? formatMetric(metrics.fps, 'fps') : 'N/A'}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
                    帧率
                  </Text>
                </View>                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {String(metrics.componentCount)}
                  </Text>
                  <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
                    组件数量
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 性能警告 */}
          {alerts.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>              <Text style={[styles.cardTitle, { color: colors.text }]}>
                性能警告 ({String(alerts.length)})
              </Text>
              {alerts.map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <FontAwesome
                    name={getAlertIcon(alert.severity)}
                    size={16}
                    color={getAlertColor(alert.severity)}
                    style={styles.alertIcon}
                  />
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertMessage, { color: colors.text }]}>
                      {alert.message}
                    </Text>
                    <Text style={[styles.alertTime, { color: colors.secondaryText }]}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 优化建议 */}
          {report.recommendations.length > 0 && (
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>优化建议</Text>
              {report.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <FontAwesome
                    name="lightbulb-o"
                    size={16}
                    color={colors.warning}
                    style={styles.recommendationIcon}
                  />
                  <Text style={[styles.recommendationText, { color: colors.text }]}>
                    {recommendation}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* 基准测试 */}
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>基准测试</Text>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                isRunningBenchmark && styles.disabledButton
              ]}
              onPress={handleRunBenchmark}
              disabled={isRunningBenchmark}
            >
              <Text style={styles.buttonText}>
                {isRunningBenchmark ? '运行中...' : '运行基准测试'}
              </Text>
            </TouchableOpacity>

            {benchmarkResults && (
              <View style={styles.benchmarkResults}>
                <Text style={[styles.benchmarkTitle, { color: colors.text }]}>
                  测试结果:
                </Text>
                {Object.entries(benchmarkResults).map(([key, value], index) => (
                  <View key={index} style={styles.benchmarkItem}>
                    <Text style={[styles.benchmarkLabel, { color: colors.secondaryText }]}>
                      {key}:
                    </Text>
                    <Text style={[styles.benchmarkValue, { color: colors.text }]}>
                      {(value as number).toFixed(2)}ms
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gradeContainer: {
    alignItems: 'center',
  },
  grade: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  gradeLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    marginTop: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  benchmarkResults: {
    marginTop: 12,
  },
  benchmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benchmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  benchmarkLabel: {
    fontSize: 14,
  },
  benchmarkValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
