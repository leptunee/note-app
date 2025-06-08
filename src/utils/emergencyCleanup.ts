// 紧急数据清理和恢复工具
import AsyncStorage from '@react-native-async-storage/async-storage';

export class EmergencyDataCleanup {
  /**
   * 彻底清理损坏的存储数据
   */
  static async cleanupCorruptedData(): Promise<void> {
    console.log('🧹 开始清理损坏的存储数据...');
    
    try {
      // 获取所有存储键
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('📋 找到存储键:', allKeys);
      
      // 需要清理的键列表
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
      
      console.log('🗑️ 准备删除键:', keysToDelete);
      
      // 批量删除
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log('✅ 成功删除损坏的数据');
      } else {
        console.log('ℹ️ 没有找到需要清理的数据');
      }
      
    } catch (error) {
      console.error('❌ 清理数据时发生错误:', error);
      // 如果批量删除失败，尝试逐个删除
      try {
        await AsyncStorage.removeItem('NOTES');
        await AsyncStorage.removeItem('CATEGORIES');
        console.log('✅ 备用清理方法成功');
      } catch (fallbackError) {
        console.error('❌ 备用清理方法也失败:', fallbackError);
        throw new Error('无法清理损坏的数据');
      }
    }
  }

  /**
   * 初始化干净的默认数据
   */
  static async initializeCleanData(): Promise<void> {
    console.log('🆕 初始化干净的默认数据...');
    
    try {
      // 清空笔记数据
      await AsyncStorage.setItem('NOTES', JSON.stringify([]));
      console.log('✅ 笔记数据已初始化为空数组');
      
      // 设置默认分类（只保存自定义分类到存储）
      await AsyncStorage.setItem('CATEGORIES', JSON.stringify([]));
      console.log('✅ 分类数据已初始化为空数组');
      
    } catch (error) {
      console.error('❌ 初始化数据时发生错误:', error);
      throw error;
    }
  }

  /**
   * 完整的数据重置流程
   */
  static async performCompleteReset(): Promise<void> {
    console.log('🔄 执行完整的数据重置...');
    
    try {
      // 步骤1: 清理损坏的数据
      await this.cleanupCorruptedData();
      
      // 步骤2: 等待一小段时间确保清理完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 步骤3: 初始化干净的数据
      await this.initializeCleanData();
      
      console.log('🎉 数据重置完成！应用现在应该可以正常工作了。');
      
    } catch (error) {
      console.error('❌ 数据重置失败:', error);
      throw error;
    }
  }

  /**
   * 检查数据是否损坏
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
      
      console.log('✅ 数据完整性检查通过');
      return true;
      
    } catch (error) {
      console.log('❌ 数据完整性检查失败:', error);
      return false;
    }
  }
}
