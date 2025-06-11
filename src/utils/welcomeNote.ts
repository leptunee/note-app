// 新用户引导笔记工具
import { Note, PageSettings } from '../hooks/useNotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const WELCOME_SEEN_KEY = 'HAS_SEEN_WELCOME';

// 检查是否为新用户（第一次打开应用）
export const isNewUser = async (): Promise<boolean> => {
  try {
    const hasSeenWelcome = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
    return !hasSeenWelcome;
  } catch (error) {
    return true; // 如果检查失败，假定为新用户
  }
};

// 标记用户已经看过欢迎内容
export const markWelcomeSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
  } catch (error) {
    console.warn('Failed to mark welcome as seen:', error);
  }
};

// 重置欢迎状态（用于测试或重新显示欢迎笔记）
export const resetWelcomeStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(WELCOME_SEEN_KEY);
  } catch (error) {
    console.warn('Failed to reset welcome status:', error);
  }
};

// 生成引导笔记内容（中文版）
const generateWelcomeContentCN = (): string => {
  return `<h1>欢迎使用 TakeNotes！📝</h1>

<p>感谢您选择 TakeNotes 作为您的智能笔记应用！这篇引导笔记将帮助您快速上手。</p>

<h2>🚀 主要功能</h2>

<h3>📝 富文本编辑</h3>
<p>• 支持<strong>粗体</strong>、<em>斜体</em>、<u>下划线</u>等文本格式</p>
<p>• 插入图片和手绘涂鸦</p>
<p>• 四种护眼主题：默认、淡绿、护眼、蓝色</p>
<p>• 自定义背景图片、透明度和模糊效果</p>

<h3>📂 智能分类</h3>
<p>• 预设分类：工作、个人、学习、未分类</p>
<p>• 创建和编辑自定义分类</p>
<p>• 侧边栏快速切换分类</p>
<p>• 批量移动笔记到指定分类</p>

<h3>🔍 强大搜索</h3>
<p>• 全文搜索笔记标题和内容</p>
<p>• 按分类筛选搜索结果</p>
<p>• 搜索关键词智能高亮</p>

<h3>📤 多格式导出</h3>
<p>• 文本文件 (.txt) - 纯文本格式</p>
<p>• Word文档 (.html) - 保留格式</p>
<p>• Markdown (.md) - 标记语法</p>
<p>• 图片 (.png) - 可视化导出</p>
<p>• 支持批量导出多篇笔记</p>

<h2>💡 快速上手</h2>

<p><strong>基本操作：</strong></p>
<p>1. 点击右上角 <strong>+</strong> 按钮创建新笔记</p>
<p>2. 长按笔记卡片进入多选模式</p>
<p>3. 点击左上角分类图标打开侧边栏</p>
<p>4. 在编辑页面右上角菜单中导出笔记</p>

<p><strong>个性化设置：</strong></p>
<p>• 编辑笔记时点击滑块图标自定义页面外观</p>
<p>• 调整背景图片透明度和模糊度</p>
<p>• 选择舒适的主题或者自定义背景图片！</p>

<h2>🌟 开始创作</h2>

<p>现在您可以开始使用 TakeNotes 记录想法、整理知识，让思考更加清晰有序！</p>

<p><em>💡 提示：这篇引导笔记已置顶，您可以随时删除它。</em></p>

<hr>

<p style="text-align: center; color: #666; font-size: 14px;">
<strong>TakeNotes v1.0.0</strong> | 让思考更清晰 ✨<br>
祝您使用愉快！
</p>`;
};

// 生成引导笔记内容（英文版）
const generateWelcomeContentEN = (): string => {
  return `<h1>Welcome to TakeNotes! 📝</h1>

<p>Thank you for choosing TakeNotes as your intelligent note-taking app! This guide will help you get started quickly.</p>

<h2>🚀 Main Features</h2>

<h3>📝 Rich Text Editing</h3>
<p>• Support <strong>bold</strong>, <em>italic</em>, <u>underline</u> and more text formatting</p>
<p>• Insert images and hand-drawn sketches</p>
<p>• Four eye-friendly themes: Default, Light Green, Sepia, Blue</p>
<p>• Custom background images, opacity and blur effects</p>

<h3>📂 Smart Categories</h3>
<p>• Preset categories: Work, Personal, Study, Uncategorized</p>
<p>• Create and edit custom categories</p>
<p>• Quick category switching via sidebar</p>
<p>• Batch move notes to specified categories</p>

<h3>🔍 Powerful Search</h3>
<p>• Full-text search of note titles and content</p>
<p>• Filter search results by category</p>
<p>• Smart highlighting of search keywords</p>

<h3>📤 Multi-format Export</h3>
<p>• Text files (.txt) - Plain text format</p>
<p>• Word documents (.html) - Format preserved</p>
<p>• Markdown (.md) - Markup syntax</p>
<p>• Images (.png) - Visual export</p>
<p>• Batch export multiple notes</p>

<h2>💡 Quick Start</h2>

<p><strong>Basic Operations:</strong></p>
<p>1. Tap the <strong>+</strong> button in top-right to create new notes</p>
<p>2. Long press note cards to enter multi-select mode</p>
<p>3. Tap the category icon in top-left to open sidebar</p>
<p>4. Export notes from the top-right menu in edit page</p>

<p><strong>Personalization:</strong></p>
<p>• Tap the slider icon while editing to customize page appearance</p>
<p>• Adjust background image opacity and blur</p>
<p>• Choose comfortable themes or customize background images!</p>

<h2>🌟 Start Creating</h2>

<p>Now you can start using TakeNotes to record ideas, organize knowledge, and make your thinking clearer and more organized!</p>

<p><em>💡 Tip: This guide note is pinned, you can delete it anytime.</em></p>

<hr>

<p style="text-align: center; color: #666; font-size: 14px;">
<strong>TakeNotes v1.0.0</strong> | Make thinking clearer ✨<br>
Enjoy using TakeNotes!
</p>`;
};

// 创建欢迎引导笔记
export const createWelcomeNote = (language: string = 'zh'): Note => {
  const now = Date.now();
  const isEnglish = language.startsWith('en');
  
  const defaultPageSettings: PageSettings = {
    themeId: 'default',
    backgroundImageOpacity: 0.3,
    marginValue: 20,
  };

  return {
    id: uuidv4(),
    title: isEnglish ? '📝 Welcome to TakeNotes!' : '📝 欢迎使用 TakeNotes！',
    content: isEnglish ? generateWelcomeContentEN() : generateWelcomeContentCN(),
    createdAt: now,
    updatedAt: now,
    pinned: true, // 置顶引导笔记
    pageSettings: defaultPageSettings,
    categoryId: 'uncategorized', // 放在"未分类"中
  };
};
