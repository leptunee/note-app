// 最终国际化功能测试
const i18n = require('./i18n.ts');

console.log('🧪 正在测试国际化功能...\n');

// 测试语言切换
console.log('📝 测试语言切换:');
i18n.default.changeLanguage('zh');
console.log(`中文: ${i18n.default.t('notes')}`);
console.log(`中文: ${i18n.default.t('pageSettings')}`);
console.log(`中文: ${i18n.default.t('work')}`);
console.log(`中文: ${i18n.default.t('backgroundImageOpacity')}`);

i18n.default.changeLanguage('en');
console.log(`English: ${i18n.default.t('notes')}`);
console.log(`English: ${i18n.default.t('pageSettings')}`);
console.log(`English: ${i18n.default.t('work')}`);
console.log(`English: ${i18n.default.t('backgroundImageOpacity')}`);

// 测试默认分类翻译
console.log('\n🏷️ 测试默认分类翻译:');
const categories = ['work', 'personal', 'study', 'uncategorized'];
categories.forEach(cat => {
  i18n.default.changeLanguage('zh');
  const zhText = i18n.default.t(cat);
  i18n.default.changeLanguage('en');
  const enText = i18n.default.t(cat);
  console.log(`${cat}: 中文=${zhText}, English=${enText}`);
});

// 测试页面设置相关翻译
console.log('\n⚙️ 测试页面设置相关翻译:');
const pageSettings = ['pageSettings', 'solidTheme', 'customBackground', 'removeBackgroundImage', 'backgroundImageOpacity', 'backgroundImageBlur', 'leftRightMargin', 'confirm'];
pageSettings.forEach(key => {
  i18n.default.changeLanguage('zh');
  const zhText = i18n.default.t(key);
  i18n.default.changeLanguage('en');
  const enText = i18n.default.t(key);
  console.log(`${key}: 中文=${zhText}, English=${enText}`);
});

console.log('\n✅ 国际化功能测试完成！');
