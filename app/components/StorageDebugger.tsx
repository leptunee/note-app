import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StorageDebugger = () => {
  const [storageInfo, setStorageInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const debugStorage = async () => {
    setLoading(true);
    try {
      let info = '=== 存储调试信息 ===\n\n';
      
      // 检查笔记数据
      const notesData = await AsyncStorage.getItem('NOTES');
      info += '笔记数据:\n';
      if (notesData) {
        const notes = JSON.parse(notesData);
        info += `找到 ${notes.length} 条笔记:\n`;
        notes.forEach((note, index) => {
          info += `  ${index + 1}. "${note.title}" (分类: ${note.categoryId || '无'})\n`;
        });
      } else {
        info += '没有找到笔记数据\n';
      }
      
      info += '\n';
      
      // 检查分类数据
      const categoriesData = await AsyncStorage.getItem('CATEGORIES');
      info += '分类数据:\n';
      if (categoriesData) {
        const categories = JSON.parse(categoriesData);
        info += `找到 ${categories.length} 个自定义分类:\n`;
        categories.forEach((cat, index) => {
          info += `  ${index + 1}. "${cat.name}" (ID: ${cat.id})\n`;
        });
      } else {
        info += '没有找到自定义分类数据\n';
      }
      
      info += '\n';
      
      // 检查所有存储键
      const allKeys = await AsyncStorage.getAllKeys();
      info += '所有存储键:\n';
      allKeys.forEach(key => {
        info += `  - ${key}\n`;
      });
      
      setStorageInfo(info);
      
    } catch (error) {
      setStorageInfo(`调试存储时发生错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = async () => {
    Alert.alert(
      '清除存储',
      '确定要清除所有存储数据吗？这将删除所有笔记和分类。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setStorageInfo('存储已清除');
            } catch (error) {
              setStorageInfo(`清除存储失败: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    debugStorage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>存储调试器</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={debugStorage}>
          <Text style={styles.buttonText}>
            {loading ? '检查中...' : '刷新存储信息'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearStorage}>
          <Text style={[styles.buttonText, styles.dangerText]}>清除存储</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.infoText}>{storageInfo}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dangerText: {
    color: 'white',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  infoText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default StorageDebugger;
