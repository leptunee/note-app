import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';

const resources = {      zh: {
    translation: {
      notes: '我的笔记',
      add: '添加笔记',
      title: '标题',
      content: '内容',
      delete: '删除',
      save: '保存',
      edit: '编辑笔记',
      back: '返回',
      maxChars: '最多{{count}}个字',
      titleTooLong: '标题不能超过{{max}}个字',
      deleteConfirmTitle: '确认删除',
      deleteConfirmMessage: '确定要删除这条笔记吗？此操作不可恢复。',
      cancel: '取消',
      lastEdited: '最后编辑',
      characters: '字符',
      character: '字符',
      untitledNote: '无标题笔记',
      noContent: '无内容',
    },
  },  en: {
    translation: {
      notes: 'My Notes',
      add: 'Add Note',
      title: 'Title',
      content: 'Content',
      delete: 'Delete',
      save: 'Save',
      edit: 'Edit Note',
      back: 'Back',
      maxChars: 'max {{count}} chars',
      titleTooLong: 'Title cannot exceed {{max}} characters',
      deleteConfirmTitle: 'Confirm Delete',
      deleteConfirmMessage: 'Are you sure you want to delete this note? This action cannot be undone.',
      cancel: 'Cancel',
      lastEdited: 'Last edited',
      characters: 'characters',
      character: 'character',
      untitledNote: 'Untitled Note',
      noContent: 'No content',
    },
  },
};

// 使用Device语言判断
// 获取设备语言的简单方法，无需依赖原生模块
const getDeviceLanguage = () => {
  // 针对iOS
  if (Platform.OS === 'ios') {
    const locale = 
      NativeModules.SettingsManager?.settings?.AppleLocale ||
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || // iOS 13前的版本
      'en'; // 默认语言
      
    return locale.slice(0, 2); // "zh_CN" -> "zh"
  }
  
  // 针对Android
  if (Platform.OS === 'android') {
    return NativeModules.I18nManager?.localeIdentifier?.slice(0, 2) || 'en';
  }
  
  // 其他平台
  return 'en';
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (cb: (lang: string) => void) => {
    const deviceLanguage = getDeviceLanguage();
    // 检查我们是否支持设备语言，如果不支持则使用fallback
    const supportedLanguage = Object.keys(resources).includes(deviceLanguage) ? deviceLanguage : 'en';
    cb(supportedLanguage);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // 确保使用v4而不是v3
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // 不转义HTML，因为React Native不需要
    },
  });

export default i18n;
