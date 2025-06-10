// 测试修复后的国际化功能
const i18n = require('i18next').default;
const { initReactI18next } = require('react-i18next');

// 模拟React Native环境
global.__DEV__ = true;
const Platform = { OS: 'android' };
const NativeModules = { I18nManager: { localeIdentifier: 'zh_CN' } };

// 定义资源
const resources = {
  zh: {
    translation: {
      notes: '我的笔记',
      title: '标题',
      content: '内容',
      allNotes: '全部笔记',
      uncategorized: '未分类',
      categories: '分类目录',
      searchNotes: '搜索笔记...',
      enterSearchTerm: '输入搜索关键词',
      noSearchResults: '未找到匹配的笔记',
      titleTooLong: '标题不能超过{{max}}个字',
      untitledNote: '无标题笔记',
      characters: '字符',
      character: '字符',
    },
  },
  en: {
    translation: {
      notes: 'My Notes',
      title: 'Title',
      content: 'Content',
      allNotes: 'All Notes',
      uncategorized: 'Uncategorized',
      categories: 'Categories',
      searchNotes: 'Search notes...',
      enterSearchTerm: 'Enter search keywords',
      noSearchResults: 'No matching notes found',
      titleTooLong: 'Title cannot exceed {{max}} characters',
      untitledNote: 'Untitled Note',
      characters: 'characters',
      character: 'character',
    },
  },
};

// 初始化i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认中文
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

console.log('Testing fixed i18n configuration...');

// 测试中文翻译
console.log('Chinese tests:');
console.log('- notes:', i18n.t('notes'));
console.log('- allNotes:', i18n.t('allNotes'));
console.log('- uncategorized:', i18n.t('uncategorized'));
console.log('- searchNotes:', i18n.t('searchNotes'));
console.log('- titleTooLong:', i18n.t('titleTooLong', { max: 50 }));

// 测试英文翻译
i18n.changeLanguage('en');
console.log('\nEnglish tests:');
console.log('- notes:', i18n.t('notes'));
console.log('- allNotes:', i18n.t('allNotes'));
console.log('- uncategorized:', i18n.t('uncategorized'));
console.log('- searchNotes:', i18n.t('searchNotes'));
console.log('- titleTooLong:', i18n.t('titleTooLong', { max: 50 }));

// 测试不存在的键
console.log('\nMissing key test:');
console.log('- nonExistentKey:', i18n.t('nonExistentKey'));

console.log('\nFixed i18n test completed successfully!');
