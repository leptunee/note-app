import AsyncStorage from '@react-native-async-storage/async-storage';

// 存储工具类 - 解决数据过大的问题
export class ChunkedStorage {
  private static readonly CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB 每块，留出安全边距
  private static readonly MAX_RETRIES = 3;

  /**
   * 分块存储大数据
   */
  static async setItem(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      const dataSize = new Blob([serializedData]).size;
      
      console.log(`📦 存储数据: ${key}, 大小: ${(dataSize / 1024).toFixed(2)}KB`);
      
      // 如果数据小于限制，直接存储
      if (dataSize < this.CHUNK_SIZE) {
        await AsyncStorage.setItem(key, serializedData);
        // 清理可能存在的分块数据
        await this.clearChunks(key);
        return;
      }

      // 数据过大，需要分块存储
      console.log(`⚠️ 数据过大，使用分块存储: ${key}`);
      
      const chunks: string[] = [];
      let startIndex = 0;
      
      while (startIndex < serializedData.length) {
        const chunk = serializedData.slice(startIndex, startIndex + this.CHUNK_SIZE);
        chunks.push(chunk);
        startIndex += this.CHUNK_SIZE;
      }
      
      // 存储分块数据
      const promises = chunks.map((chunk, index) => 
        AsyncStorage.setItem(`${key}_chunk_${index}`, chunk)
      );
      
      await Promise.all(promises);
      
      // 存储元数据
      await AsyncStorage.setItem(`${key}_meta`, JSON.stringify({
        chunked: true,
        totalChunks: chunks.length,
        originalSize: dataSize
      }));
      
      // 删除原始key（如果存在）
      await AsyncStorage.removeItem(key);
      
      console.log(`✅ 分块存储完成: ${key}, 共${chunks.length}块`);
      
    } catch (error) {
      console.error(`❌ 存储失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 读取分块数据
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      // 首先尝试直接读取
      const directData = await AsyncStorage.getItem(key);
      if (directData !== null) {
        return directData;
      }

      // 检查是否有分块数据
      const metaData = await AsyncStorage.getItem(`${key}_meta`);
      if (!metaData) {
        return null;
      }

      const meta = JSON.parse(metaData);
      if (!meta.chunked) {
        return null;
      }

      console.log(`📦 读取分块数据: ${key}, 共${meta.totalChunks}块`);

      // 读取所有分块
      const chunkPromises = Array.from({ length: meta.totalChunks }, (_, index) =>
        AsyncStorage.getItem(`${key}_chunk_${index}`)
      );

      const chunks = await Promise.all(chunkPromises);
      
      // 检查是否有丢失的分块
      const missingChunks = chunks.findIndex(chunk => chunk === null);
      if (missingChunks !== -1) {
        console.error(`❌ 分块数据不完整: ${key}, 缺失分块${missingChunks}`);
        return null;
      }

      const reconstructedData = chunks.join('');
      console.log(`✅ 分块数据重建完成: ${key}`);
      
      return reconstructedData;
      
    } catch (error) {
      console.error(`❌ 读取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除数据（包括分块）
   */
  static async removeItem(key: string): Promise<void> {
    try {
      // 删除直接存储的数据
      await AsyncStorage.removeItem(key);
      
      // 检查并删除分块数据
      const metaData = await AsyncStorage.getItem(`${key}_meta`);
      if (metaData) {
        const meta = JSON.parse(metaData);
        if (meta.chunked) {
          const deletePromises = Array.from({ length: meta.totalChunks }, (_, index) =>
            AsyncStorage.removeItem(`${key}_chunk_${index}`)
          );
          await Promise.all(deletePromises);
        }
        await AsyncStorage.removeItem(`${key}_meta`);
      }
      
    } catch (error) {
      console.error(`❌ 删除失败: ${key}`, error);
      throw error;
    }
  }

  /**
   * 清理指定key的所有分块
   */
  private static async clearChunks(key: string): Promise<void> {
    try {
      const metaData = await AsyncStorage.getItem(`${key}_meta`);
      if (metaData) {
        const meta = JSON.parse(metaData);
        if (meta.chunked) {
          const deletePromises = Array.from({ length: meta.totalChunks }, (_, index) =>
            AsyncStorage.removeItem(`${key}_chunk_${index}`)
          );
          await Promise.all(deletePromises);
        }
        await AsyncStorage.removeItem(`${key}_meta`);
      }
    } catch (error) {
      // 忽略清理错误
      console.warn(`⚠️ 清理分块数据时出错: ${key}`, error);
    }
  }

  /**
   * 获取存储统计信息
   */
  static async getStorageStats(): Promise<{
    totalKeys: number;
    chunkedKeys: string[];
    totalSize: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const chunkedKeys: string[] = [];
      let totalSize = 0;

      for (const key of allKeys) {
        if (key.endsWith('_meta')) {
          const baseKey = key.replace('_meta', '');
          chunkedKeys.push(baseKey);
        } else if (!key.includes('_chunk_')) {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            totalSize += new Blob([data]).size;
          }
        }
      }

      return {
        totalKeys: allKeys.length,
        chunkedKeys,
        totalSize
      };
      
    } catch (error) {
      console.error('❌ 获取存储统计失败', error);
      return { totalKeys: 0, chunkedKeys: [], totalSize: 0 };
    }
  }

  /**
   * 数据压缩存储（可选功能）
   */
  static async setItemCompressed(key: string, data: any): Promise<void> {
    // 这里可以添加数据压缩逻辑
    // 目前先使用分块存储
    return this.setItem(key, data);
  }
}

/**
 * 数据恢复工具
 */
export class DataRecovery {
  /**
   * 尝试恢复损坏的数据
   */
  static async attemptRecovery(key: string): Promise<any> {
    try {
      console.log(`🔧 尝试恢复数据: ${key}`);
      
      // 1. 尝试直接读取
      const directData = await AsyncStorage.getItem(key);
      if (directData) {
        try {
          return JSON.parse(directData);
        } catch (parseError) {
          console.log(`📝 直接数据损坏，尝试其他方法: ${key}`);
        }
      }

      // 2. 尝试读取分块数据
      const recoveredData = await ChunkedStorage.getItem(key);
      if (recoveredData) {
        try {
          return JSON.parse(recoveredData);
        } catch (parseError) {
          console.log(`📝 分块数据损坏: ${key}`);
        }
      }

      // 3. 尝试从备份读取（如果有）
      const backupData = await AsyncStorage.getItem(`${key}_backup`);
      if (backupData) {
        try {
          return JSON.parse(backupData);
        } catch (parseError) {
          console.log(`📝 备份数据损坏: ${key}`);
        }
      }

      console.log(`❌ 无法恢复数据: ${key}`);
      return null;
      
    } catch (error) {
      console.error(`❌ 数据恢复失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 创建数据备份
   */
  static async createBackup(key: string, data: any): Promise<void> {
    try {
      const backupKey = `${key}_backup`;
      await ChunkedStorage.setItem(backupKey, data);
      console.log(`💾 创建备份: ${backupKey}`);
    } catch (error) {
      console.warn(`⚠️ 创建备份失败: ${key}`, error);
    }
  }
}
