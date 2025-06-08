// 调试存储状态的脚本
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function debugStorage() {
  try {
    console.log('=== 调试存储状态 ===');
    
    // 检查笔记数据
    const notesData = await AsyncStorage.getItem('NOTES');
    console.log('\n笔记数据:');
    if (notesData) {
      const notes = JSON.parse(notesData);
      console.log(`找到 ${notes.length} 条笔记:`);
      notes.forEach((note, index) => {
        console.log(`  ${index + 1}. ${note.title} (分类: ${note.categoryId || '无'})`);
      });
    } else {
      console.log('没有找到笔记数据');
    }
    
    // 检查分类数据
    const categoriesData = await AsyncStorage.getItem('CATEGORIES');
    console.log('\n分类数据:');
    if (categoriesData) {
      const categories = JSON.parse(categoriesData);
      console.log(`找到 ${categories.length} 个分类:`);
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log('没有找到分类数据');
    }
    
    // 检查所有AsyncStorage键
    console.log('\n所有存储键:');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(allKeys);
    
  } catch (error) {
    console.error('调试存储时发生错误:', error);
  }
}

module.exports = { debugStorage };
