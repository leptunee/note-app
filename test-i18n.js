// 简单的国际化测试脚本
const { Platform } = require('react-native');
const i18n = require('./i18n.ts').default;

console.log('Testing i18n configuration...');

// 测试资源是否正确加载
console.log('Available languages:', Object.keys(i18n.options.resources));

// 测试中文翻译
i18n.changeLanguage('zh');
console.log('Chinese - notes:', i18n.t('notes'));
console.log('Chinese - title:', i18n.t('title'));
console.log('Chinese - content:', i18n.t('content'));

// 测试英文翻译
i18n.changeLanguage('en');
console.log('English - notes:', i18n.t('notes'));
console.log('English - title:', i18n.t('title'));
console.log('English - content:', i18n.t('content'));

// 测试插值
console.log('Interpolation test:', i18n.t('titleTooLong', { max: 50 }));

console.log('i18n test completed.');
