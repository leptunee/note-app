// 验证翻译键完整性
const i18nContent = require('fs').readFileSync('./i18n.ts', 'utf8');

console.log('🔍 检查翻译键是否完整...\n');

// 检查页面设置相关的翻译键
const pageSettingsKeys = [
  'pageSettings',
  'solidTheme', 
  'customBackground',
  'removeBackgroundImage',
  'backgroundImageOpacity',
  'backgroundImageBlur',
  'leftRightMargin',
  'confirm'
];

console.log('📋 页面设置翻译键检查:');
pageSettingsKeys.forEach(key => {
  const zhExists = i18nContent.includes(`${key}: '`) && i18nContent.indexOf(`${key}: '`) < i18nContent.indexOf('en: {');
  const enExists = i18nContent.includes(`${key}: '`) && i18nContent.indexOf(`${key}: '`) > i18nContent.indexOf('en: {');
  console.log(`${key}: 中文=${zhExists ? '✅' : '❌'}, English=${enExists ? '✅' : '❌'}`);
});

// 检查默认分类翻译键
const categoryKeys = ['work', 'personal', 'study', 'uncategorized'];
console.log('\n🏷️ 默认分类翻译键检查:');
categoryKeys.forEach(key => {
  const zhExists = i18nContent.includes(`${key}: '`) && i18nContent.indexOf(`${key}: '`) < i18nContent.indexOf('en: {');
  const enExists = i18nContent.includes(`${key}: '`) && i18nContent.indexOf(`${key}: '`) > i18nContent.indexOf('en: {');
  console.log(`${key}: 中文=${zhExists ? '✅' : '❌'}, English=${enExists ? '✅' : '❌'}`);
});

console.log('\n✅ 翻译键检查完成！');
