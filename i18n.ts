import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'react-native-localize';

const resources = {
  zh: {
    translation: {
      notes: '我的笔记',
      add: '添加笔记',
      title: '标题',
      content: '内容',
      delete: '删除',
    },
  },
  en: {
    translation: {
      notes: 'My Notes',
      add: 'Add Note',
      title: 'Title',
      content: 'Content',
      delete: 'Delete',
    },
  },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (cb: (lang: string) => void) => {
    const locales = Localization.getLocales();
    cb(locales[0]?.languageCode || 'en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
