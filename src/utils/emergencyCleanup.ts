// 紧急数据清理和恢复工具
import AsyncStorage from '@react-native-async-storage/async-storage';

export class EmergencyDataCleanup {
  /**
   * 彻底清理损坏的存储数�?
   */
  static async cleanupCorruptedData(): Promise<void> {

    
    try {
      // 获取所有存储键
      const allKeys = await AsyncStorage.getAllKeys();

      
      // 需要清理的键列�?
      const keysToClean = ['NOTES', 'CATEGORIES'];
      const keysToDelete = [];
      
      // 查找所有相关的键（包括分块键）
      for (const key of allKeys) {
        for (const targetKey of keysToClean) {
          if (key === targetKey || key.startsWith(`${targetKey}_chunk_`) || key.startsWith(`${targetKey}_backup_`)) {
            keysToDelete.push(key);
          }
        }
      }
      

      
      // 批量删除
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);

      } else {

      }
      
    } catch (error) {      // 如果批量删除失败，尝试逐个删除
      try {        await AsyncStorage.removeItem('NOTES');
        await AsyncStorage.removeItem('CATEGORIES');
      } catch (fallbackError) {
        // 记录错误但不抛出
        throw new Error('Failed to clean corrupted data');
      }
    }
  }

  /**
   * 初始化干净的默认数�?
   */
  static async initializeCleanData(): Promise<void> {

    
    try {
      // 清空笔记数据
      await AsyncStorage.setItem('NOTES', JSON.stringify([]));

      
      // 设置默认分类（只保存自定义分类到存储�?
      await AsyncStorage.setItem('CATEGORIES', JSON.stringify([]));

      
    } catch (error) {

      throw error;
    }
  }

  /**
   * 完整的数据重置流�?
   */
  static async performCompleteReset(): Promise<void> {

    
    try {
      // 步骤1: 清理损坏的数�?
      await this.cleanupCorruptedData();
      
      // 步骤2: 等待一小段时间确保清理完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 步骤3: 初始化干净的数�?
      await this.initializeCleanData();
      

      
    } catch (error) {

      throw error;
    }
  }

  /**
   * 检查数据是否损�?
   */
  static async checkDataIntegrity(): Promise<boolean> {
    try {
      // 尝试读取笔记数据
      const notesData = await AsyncStorage.getItem('NOTES');
      if (notesData) {
        JSON.parse(notesData); // 尝试解析
      }
      
      // 尝试读取分类数据
      const categoriesData = await AsyncStorage.getItem('CATEGORIES');
      if (categoriesData) {
        JSON.parse(categoriesData); // 尝试解析
      }
      

      return true;
      
    } catch (error) {

      return false;
    }
  }
}
