import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform, NativeModules } from 'react-native';
import * as Localization from 'expo-localization';

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
      characters: '字符',      character: '字符',      untitledNote: '无标题笔记',
      noContent: '无内容',
      searchNotes: '搜索笔记...',      enterSearchTerm: '输入搜索关键词',
      noSearchResults: '未找到匹配的笔记',
      tryDifferentKeywords: '尝试使用不同的关键词',
      noCategoryNotes: '该分类下暂无笔记',
      selectDifferentCategory: '选择其他分类查看',
      foundResults_one: '找到 {{count}} 条笔记',
      foundResults_other: '找到 {{count}} 条笔记',      about: '关于',
      version: '版本号',
      authorEmail: '作者邮箱',      description: '记录思考，备份想法。\n让 TakeNotes 成为您思考的延伸。',      appName: '做笔记',
      // 赞助相关
      sponsorAuthor: '赞助作者',
      supportDevelopment: '支持开发',
      thankYouForSupport: '感谢您的支持！',
      // 分类相关
      allNotes: '全部笔记',
      uncategorized: '未分类',
      categories: '分类目录',
      selectCategory: '选择分类',
      addCategory: '新建分类',
      editCategory: '编辑分类',
      categoryName: '分类名称',
      categoryIcon: '分类图标',
      categoryColor: '分类颜色',
      categoryNameRequired: '分类名称不能为空',
      categoryNameTooLong: '分类名称不能超过20个字符',      enterCategoryName: '请输入分类名称',
      confirmDeleteCategory: '确定要删除这个分类吗？该分类下的笔记将移动到未分类目录下。',
      confirmDelete: '确认删除',      // 导出相关
      hint: '提示',
      selectNotesFirst: '请先选择要导出的笔记',
      exportingText: '正在导出文本文件...',
      exportingMarkdown: '正在导出Markdown文件...',
      exportingImage: '正在导出图片...',
      exportingWord: '正在导出Word文档...',
      exportTextError: '导出文本文件时发生错误',
      exportMarkdownError: '导出Markdown文件时发生错误',      exportImageError: '导出图片时发生错误',
      exportWordError: '导出Word文档时发生错误',
      cannotGetNoteView: '无法获取笔记视图以截图。',      // 导出模态框
      selectExportFormat: '选择导出格式',
      exportOperationFailed: '导出操作失败，请重试。',
      textFile: '文本文件 (.txt)',
      wordDocument: 'Word文档 (.html)',
      markdownFile: 'Markdown (.md)',
      imageFile: '图片 (.png)',
      // 笔记操作相关
      exportNote: '导出笔记',
      pinNote: '置顶笔记',
      unpinNote: '取消置顶',
      deleteNote: '删除笔记',
      // 批量操作相关
      singleNote: '笔记',
      multipleNotes: '篇笔记',
      confirmDeleteSelected: '确定要删除所选的',
      questionMark: '吗？',
      // 主题名称
      themeDefault: '默认',
      themeLight: '淡绿',
      themeSepia: '护眼',
      themeBlue: '蓝色',
      // 导出成功消息
      noteExportedAsText: '笔记已成功导出为文本文件。',
      shareUnavailableText: '分享功能不可用，无法导出文本文件。',
      exportTextFailed: '导出文本文件失败，请重试。',
      noteExportedAsWord: '笔记已导出为Word文档并分享成功。',
      shareUnavailableWord: '分享功能不可用，无法导出Word文档。',
      exportWordFailed: '导出Word文档失败，请重试。',
      noteExportedAsMarkdown: '笔记已导出为Markdown文件并分享成功。',
      shareUnavailableMarkdown: '分享功能不可用，无法导出Markdown文件。',
      exportMarkdownFailed: '导出Markdown失败，请重试。',
      storagePermissionRequired: '需要存储权限来保存图片。',
      imageSharedSuccessfully: '图片已保存到相册并成功分享。',
      imageSavedOnly: '图片已保存到相册。分享功能当前不可用。',
      shareImageFailed: '分享功能不可用，无法完成图片导出。',
      shareFeatureUnavailable: '分享功能不可用。',
      invalidImageFile: '创建的图片文件无效或无法访问。',
      imageAccessError: 'Error checking file, cannot access image.',
      noteAppAlbum: 'Note App',
      imageSharedOnly: 'Image shared successfully.',
      imageSavedButShareFailed: 'Image saved to album, but sharing failed.',
      imageShareFailed: 'Image sharing failed.',
      // 批量导出相关
      noNotesSelected: '没有选择任何笔记。',
      batchExportTextFailed: '批量导出文本文件失败，请重试。',
      batchExportWordFailed: '批量导出Word文档失败，请重试。',
      batchExportMarkdownFailed: '批量导出Markdown失败，请重试。',
      // 批量导出成功消息
      batchExportedText: '已成功导出 {{count}} 篇笔记为文本文件。',
      batchExportedWord: '已成功导出 {{count}} 篇笔记为Word文档。',
      batchExportedMarkdown: '已成功导出 {{count}} 篇笔记为Markdown文件。',
      // 默认分类名称
      work: '工作',
      personal: '个人',
      study: '学习',
      // Toast消息
      saveSuccess: '保存成功',
      saveFailed: '保存失败，请重试',
      pinStatusUpdated: '已更新置顶状态',
      exportError: '导出过程中发生错误，请重试。',      // 页面设置相关
      pageSettings: '页面设置',
      solidTheme: '纯色主题',
      customBackground: '自定义背景图片',
      currentBackgroundSet: '当前已设置背景图片',
      changeCustomImage: '更换自定义图片',
      selectCustomImage: '选择自定义图片',
      removeBackgroundImage: '移除背景图片',
      backgroundImageOpacity: '背景图片透明度',
      backgroundImageBlur: '背景模糊度',
      leftRightMargin: '左右页边距',
      confirm: '确定',
      albumPermissionRequired: '需要相册权限才能选择背景图片！',
      // 图片alt/title属性
      insertedImage: '插入的图片',
      drawing: '涂鸦',      // 选择工具栏
      selectAll: '全选',
      unpin: '取消',
      pin: '置顶',
      move: '移动',
      export: '导出',      // 分类相关
      category: '分类',      // 绘图功能
      brush: '笔刷',
      paint: '画笔',
      pixelEraser: '像素橡皮',
      strokeEraser: '笔画橡皮',
      color: '颜色',      // 编辑器占位符
      writeSomething: '开始记录...',
      initializingEditor: '正在初始化编辑器...',
      
      // 欢迎引导笔记相关
      welcomeNoteTitle: '📝 欢迎使用 TakeNotes！',
      welcomeGuide: '新用户引导',
      devMode: '开发者模式',
      resetWelcomeStatus: '重置欢迎状态',
      resetSuccess: '欢迎状态已重置。重启应用后将再次显示引导笔记。',
      resetFailed: '重置失败，请重试。',
      
      // 错误提示和编辑器相关
      insertFailed: '插入失败',
      cannotInsertDrawingToEditor: '无法将涂鸦插入到编辑器中',
      drawingInsertFailed: '涂鸦插入失败',
      editorVersionNotSupported: '编辑器版本不支持此功能',
      imageInsertFailed: '图片插入失败',
      imageSelectionError: '图片选择出错',
      error: '错误',
      permissionDenied: '权限被拒绝',
    },
  },en: {
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
      characters: 'characters',      character: 'character',      untitledNote: 'Untitled Note',
      noContent: 'No content',
      searchNotes: 'Search notes...',      enterSearchTerm: 'Enter search keywords',
      noSearchResults: 'No matching notes found',
      tryDifferentKeywords: 'Try different keywords',
      noCategoryNotes: 'No notes in this category',
      selectDifferentCategory: 'Select a different category',
      foundResults_one: 'Found {{count}} note',
      foundResults_other: 'Found {{count}} notes',      about: 'About',
      version: 'Version',
      authorEmail: 'Author Email',      description: 'Record thoughts, backup ideas.\nLet TakeNotes be an extension of your thinking.',      appName: 'Take Notes',
      // Sponsor related
      sponsorAuthor: 'Sponsor Author',
      supportDevelopment: 'Support Development',
      thankYouForSupport: 'Thank you for your support!',
      // Categories related
      allNotes: 'All Notes',
      uncategorized: 'Uncategorized',
      categories: 'Categories',
      selectCategory: 'Select Category',
      addCategory: 'Add Category',
      editCategory: 'Edit Category',
      categoryName: 'Category Name',
      categoryIcon: 'Category Icon',
      categoryColor: 'Category Color',
      categoryNameRequired: 'Category name cannot be empty',
      categoryNameTooLong: 'Category name cannot exceed 20 characters',      enterCategoryName: 'Enter category name',
      confirmDeleteCategory: 'Are you sure you want to delete this category? Notes in this category will be moved to "Uncategorized".',
      confirmDelete: 'Confirm Delete',      // Export related
      hint: 'Hint',
      selectNotesFirst: 'Please select notes to export first',
      exportingText: 'Exporting text file...',
      exportingMarkdown: 'Exporting Markdown file...',
      exportingImage: 'Exporting image...',
      exportingWord: 'Exporting Word document...',
      exportTextError: 'Error occurred while exporting text file',
      exportMarkdownError: 'Error occurred while exporting Markdown file',      exportImageError: 'Error occurred while exporting image',
      exportWordError: 'Error occurred while exporting Word document',
      cannotGetNoteView: 'Cannot get note view for screenshot.',      // Export modal
      selectExportFormat: 'Select Export Format',
      exportOperationFailed: 'Export operation failed, please try again.',
      textFile: 'Text File (.txt)',
      wordDocument: 'Word Document (.html)',
      markdownFile: 'Markdown (.md)',
      imageFile: 'Image File (.png)',
      // Note operations related
      exportNote: 'Export Note',
      pinNote: 'Pin Note',
      unpinNote: 'Unpin Note',
      deleteNote: 'Delete Note',
      // Batch operations related
      singleNote: 'note',
      multipleNotes: 'notes',
      confirmDeleteSelected: 'Confirm delete selected',
      questionMark: '?',
      // 主题名称
      themeDefault: 'Default',
      themeLight: 'Light Green',
      themeSepia: 'Sepia',      themeBlue: 'Blue',      
      // Export success messages
      noteExportedAsText: 'Note exported as text file successfully.',
      shareUnavailableText: 'Share feature unavailable, cannot export text file.',
      exportTextFailed: 'Export text file failed, please try again.',
      noteExportedAsWord: 'Note exported as Word document and shared successfully.',
      shareUnavailableWord: 'Share feature unavailable, cannot export Word document.',
      exportWordFailed: 'Export Word document failed, please try again.',
      noteExportedAsMarkdown: 'Note exported as Markdown file and shared successfully.',
      shareUnavailableMarkdown: 'Share feature unavailable, cannot export Markdown file.',
      exportMarkdownFailed: 'Export Markdown failed, please try again.',
      storagePermissionRequired: 'Storage permission required to save image.',
      imageSharedSuccessfully: 'Image saved to album and shared successfully.',
      imageSavedOnly: 'Image saved to album. Share feature currently unavailable.',
      shareImageFailed: 'Share feature unavailable, cannot complete image export.',
      shareFeatureUnavailable: 'Share feature unavailable.',
      invalidImageFile: 'Created image file is invalid or inaccessible.',
      imageAccessError: 'Error checking file, cannot access image.',
      noteAppAlbum: 'Note App',
      imageSharedOnly: 'Image shared successfully.',
      imageSavedButShareFailed: 'Image saved to album, but sharing failed.',
      imageShareFailed: 'Image sharing failed.',
      // Batch export related
      noNotesSelected: 'No notes selected.',
      batchExportTextFailed: 'Batch export text files failed, please try again.',
      batchExportWordFailed: 'Batch export Word documents failed, please try again.',
      batchExportMarkdownFailed: 'Batch export Markdown failed, please try again.',
      // Batch export success messages
      batchExportedText: 'Successfully exported {{count}} notes as text files.',
      batchExportedWord: 'Successfully exported {{count}} notes as Word documents.',
      batchExportedMarkdown: 'Successfully exported {{count}} notes as Markdown files.',
      // Default category names
      work: 'Work',
      personal: 'Personal',
      study: 'Study',
      // Toast messages
      saveSuccess: 'Save successful',
      saveFailed: 'Save failed, please try again',
      pinStatusUpdated: 'Pin status updated',
      exportError: 'Error occurred during export, please try again.',
      // Page settings related
      pageSettings: 'Page Settings',
      solidTheme: 'Solid Theme',
      customBackground: 'Custom Background Image',
      currentBackgroundSet: 'Background image currently set',
      changeCustomImage: 'Change Custom Image',
      selectCustomImage: 'Select Custom Image',
      removeBackgroundImage: 'Remove Background Image',
      backgroundImageOpacity: 'Background Image Opacity',
      backgroundImageBlur: 'Background Blur',
      leftRightMargin: 'Left/Right Margin',
      confirm: 'Confirm',
      albumPermissionRequired: 'Album permission required to select background image!',
      // Image alt/title attributes
      insertedImage: 'Inserted Image',
      drawing: 'Drawing',
      // Selection toolbar
      selectAll: 'Select All',
      unpin: 'Unpin',
      pin: 'Pin',
      move: 'Move',
      export: 'Export',
      // Category related
      category: 'Category',      
      // 绘图功能
      brush: 'Brush',
      paint: 'Paint',
      pixelEraser: 'Pixel Eraser',
      strokeEraser: 'Stroke Eraser',
      color: 'Color',      // 编辑器占位符
      writeSomething: 'Write something...',
      initializingEditor: 'Initializing editor...',
      
      // 欢迎引导笔记相关
      welcomeNoteTitle: '📝 Welcome to TakeNotes!',
      welcomeGuide: 'Welcome Guide',
      devMode: 'Developer Mode',
      resetWelcomeStatus: 'Reset Welcome Status',
      resetSuccess: 'Welcome status has been reset. The guide note will appear again after restarting the app.',
      resetFailed: 'Reset failed, please try again.',
      
      // 错误提示和编辑器相关
      insertFailed: 'Insert Failed',
      cannotInsertDrawingToEditor: 'Cannot insert drawing to editor',
      drawingInsertFailed: 'Drawing insert failed',
      editorVersionNotSupported: 'Editor version not supported',
      imageInsertFailed: 'Image insert failed',
      imageSelectionError: 'Image selection error',
      error: 'Error',
      permissionDenied: 'Permission Denied',
    },
  },
};

// 使用Device语言判断
// 获取设备语言的更可靠方法
const getDeviceLanguage = () => {
  try {
    let deviceLanguage = 'en'; // 默认英文，更符合国际标准
    
    // 首先尝试使用expo-localization，这是最可靠的方法
    try {
      const locale = Localization.locale || Localization.getLocales()?.[0]?.languageCode;
      if (locale) {
        deviceLanguage = locale.slice(0, 2); // "zh_CN" -> "zh", "en_US" -> "en"
        console.log('Expo Localization detected locale:', locale, 'Using language:', deviceLanguage);
      }
    } catch (expoError) {
      console.warn('Expo localization failed:', expoError);
      
      // 回退到原有的方法
      if (Platform.OS === 'ios') {
        const locale = 
          NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
          NativeModules.I18nManager?.localeIdentifier;
          
        if (locale) {
          deviceLanguage = locale.slice(0, 2);
          console.log('iOS fallback detected locale:', locale, 'Using language:', deviceLanguage);
        }
      }
      
      if (Platform.OS === 'android') {
        const locale = 
          NativeModules.I18nManager?.localeIdentifier ||
          NativeModules.SettingsManager?.settings?.localeIdentifier;
        
        if (locale) {
          deviceLanguage = locale.slice(0, 2);
          console.log('Android fallback detected locale:', locale, 'Using language:', deviceLanguage);
        }
      }
    }
    
    // 检查是否支持检测到的语言
    const supportedLanguages = ['zh', 'en'];
    const finalLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
    
    console.log('Final language choice:', finalLanguage);
    return finalLanguage;
    
  } catch (error) {
    console.warn('Failed to get device language:', error);
    return 'en'; // 出错时返回英文作为默认语言
  }
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (cb: (lang: string) => void) => {
    try {
      const deviceLanguage = getDeviceLanguage();
      console.log('Language detector - Device language:', deviceLanguage);
      cb(deviceLanguage);
    } catch (error) {
      console.warn('Language detection failed:', error);
      cb('en'); // 出错时使用英文
    }
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
    // 不设置 lng，让语言检测器决定语言
    fallbackLng: 'en', // 改为回退到英文，这是更通用的做法
    debug: __DEV__, // 只在开发环境启用调试
    interpolation: {
      escapeValue: false, // 不转义HTML，因为React Native不需要
    },
    react: {
      useSuspense: false, // 禁用Suspense，避免在React Native中的问题
    }
  })
  .then(() => {
    console.log('i18n initialized successfully. Current language:', i18n.language);
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

// 注意: expo-localization 不支持实时语言变化监听
// 如果需要响应语言变化，需要在应用重新启动时重新初始化

export default i18n;
