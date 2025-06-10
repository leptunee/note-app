// 测试国际化配置的调试脚本
import './i18n';
import i18n from 'i18next';
import * as Localization from 'expo-localization';

console.log('=== 国际化调试信息 ===');

// 显示系统信息
console.log('设备信息:');
console.log('- Expo Localization.locale:', Localization.locale);
console.log('- Expo Localization.getLocales():', Localization.getLocales());

// 显示i18n状态
setTimeout(() => {
  console.log('\ni18n 状态:');
  console.log('- 当前语言:', i18n.language);
  console.log('- 支持的语言:', Object.keys(i18n.options.resources));
  console.log('- 回退语言:', i18n.options.fallbackLng);
  
  // 测试翻译
  console.log('\n翻译测试:');
  console.log('- notes (中文):', i18n.t('notes', { lng: 'zh' }));
  console.log('- notes (英文):', i18n.t('notes', { lng: 'en' }));
  console.log('- notes (当前语言):', i18n.t('notes'));
  
  console.log('- appName (中文):', i18n.t('appName', { lng: 'zh' }));
  console.log('- appName (英文):', i18n.t('appName', { lng: 'en' }));
  console.log('- appName (当前语言):', i18n.t('appName'));
}, 1000);
