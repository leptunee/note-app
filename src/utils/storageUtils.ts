import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage utility - solve data size issues
export class ChunkedStorage {
  private static readonly CHUNK_SIZE = 1.5 * 1024 * 1024; // 1.5MB per chunk, with safety margin
  private static readonly MAX_RETRIES = 3;

  /**
   * Store large data in chunks
   */
  static async setItem(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      const dataSize = new Blob([serializedData]).size;
      

      
      // 如果数据小于限制，直接存�?
      if (dataSize < this.CHUNK_SIZE) {
        await AsyncStorage.setItem(key, serializedData);
        // 清理可能存在的分块数�?
        await this.clearChunks(key);
        return;
      }

      // 数据过大，需要分块存�?

      
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
      
      // 存储元数�?
      await AsyncStorage.setItem(`${key}_meta`, JSON.stringify({
        chunked: true,
        totalChunks: chunks.length,
        originalSize: dataSize
      }));
      
      // 删除原始key（如果存在）
      await AsyncStorage.removeItem(key);
      

      
    } catch (error) {

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



      // 读取所有分�?
      const chunkPromises = Array.from({ length: meta.totalChunks }, (_, index) =>
        AsyncStorage.getItem(`${key}_chunk_${index}`)
      );

      const chunks = await Promise.all(chunkPromises);
      
      // 检查是否有丢失的分�?
      const missingChunks = chunks.findIndex(chunk => chunk === null);
      if (missingChunks !== -1) {

        return null;
      }

      const reconstructedData = chunks.join('');

      
      return reconstructedData;
      
    } catch (error) {

      return null;
    }
  }

  /**
   * 删除数据（包括分块）
   */
  static async removeItem(key: string): Promise<void> {
    try {
      // 删除直接存储的数�?
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

      throw error;
    }
  }

  /**
   * 清理指定key的所有分�?
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

    }
  }

}

/**
 * 数据恢复工具
 */
export class DataRecovery {
  /**
   * 尝试恢复损坏的数�?
   */
  static async attemptRecovery(key: string): Promise<any> {
    try {

      
      // 1. 尝试直接读取
      const directData = await AsyncStorage.getItem(key);
      if (directData) {
        try {
          return JSON.parse(directData);
        } catch (parseError) {

        }
      }

      // 2. 尝试读取分块数据
      const recoveredData = await ChunkedStorage.getItem(key);
      if (recoveredData) {
        try {
          return JSON.parse(recoveredData);
        } catch (parseError) {

        }
      }

      // 3. 尝试从备份读取（如果有）
      const backupData = await AsyncStorage.getItem(`${key}_backup`);
      if (backupData) {
        try {
          return JSON.parse(backupData);
        } catch (parseError) {

        }
      }


      return null;
      
    } catch (error) {

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

    } catch (error) {

    }
  }
}
