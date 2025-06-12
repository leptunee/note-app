# TakeNotes - 智能笔记应用

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.2-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-53.0.7-000020.svg)

🌍 **语言**: **中文** | [English](README.md)

一款基于 React Native 和 Expo 开发的现代化笔记应用。致力于帮助记录思考、备份想法，让做笔记（TakeNotes）成为思考的延伸。

##  核心功能

### 📝 富文本编辑
- 支持文本格式化（粗体、斜体、下划线等）
- 插入图片和涂鸦
- 自定义页面设置（背景、透明度、边距等）
- 多种主题模式（默认、淡绿、护眼、蓝色）
- 实时字数统计

### 📂 分类管理
- 预设分类：工作、个人、学习、未分类
- 自定义分类创建和编辑
- 分类图标和颜色自定义
- 侧边栏快速切换分类
- 批量移动笔记到指定分类

### 🔍 搜索
- 全文搜索笔记内容
- 按分类筛选搜索结果
- 搜索关键词高亮显示
- 实时搜索结果统计

### 📤 多格式导出
- **文本文件** (.txt) - 纯文本导出
- **Word文档** (.html) - 富文本格式保留
- **Markdown** (.md) - 支持标记语法
- **图片** (.png) - 可视化导出
- 批量导出多篇笔记

### 🌍 国际化支持
- 中英文双语切换
- 自动检测系统语言
- 完整的界面本地化

### 📌 实用功能
- 笔记置顶/取消置顶
- 多选模式批量操作
- 长按进入选择模式

##  技术特色

### 性能优化
- React.memo 组件缓存
- useCallback/useMemo 优化
- FlatList 虚拟化列表
- 批量操作减少渲染
- 分块存储数据管理

### 用户体验
- 流畅的动画效果
- 键盘感知滚动
- 工具栏智能避让
- 响应式界面设计

## 📱 界面截图

![主界面截图](/Screenshot_20250611_183019.jpg)
![笔记编辑页面截图(自定义背景)](/Screenshot_20250611_183330.jpg)

## 🛠️ 技术栈

- **框架**: React Native 0.79.2
- **开发平台**: Expo 53.0.7
- **路由**: Expo Router 5.0.5
- **富文本编辑**: @10play/tentap-editor 0.7.0
- **国际化**: react-i18next 15.5.1
- **状态管理**: React Hooks
- **数据存储**: AsyncStorage
- **图片处理**: react-native-view-shot
- **键盘处理**: react-native-keyboard-aware-scroll-view

##  系统要求

### Android
- Android 6.0 (API Level 23) 或更高版本
- ARM64 架构支持

##  开发环境配置

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Expo CLI
- Android Studio (Android 开发)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd noteApp
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **运行到设备**
```bash
# Android
npm run android

# Web (开发预览)
npm run web
```

5. **权限管理**
```bash
# 检查权限配置
npm run check-permissions

# 修复权限配置
npm run fix-permissions

# Android 清理构建（自动修复权限）
npm run prebuild:android
```

## 🛠️ 开发工具

### 权限管理
- `check-permissions`：检查 Android 权限配置
- `fix-permissions`：自动修复敏感权限配置
- `prebuild:android`：清理重建 Android 项目并修复权限

### 构建脚本
- `build:android`：构建 Android 应用
- `build:preview`：构建预览版本

##  项目结构

```
noteApp/
├── app/                    # 应用页面和路由
│   ├── components/         # 组件库
│   │   ├── features/       # 功能组件
│   │   │   ├── categories/ # 分类管理
│   │   │   ├── editor/     # 编辑器组件
│   │   │   ├── export/     # 导出功能
│   │   │   ├── notes/      # 笔记列表
│   │   │   └── settings/   # 设置组件
│   │   ├── ui/            # 通用UI组件
│   │   └── styles/        # 样式文件
│   ├── index.tsx          # 主页面
│   ├── note-edit.tsx      # 笔记编辑页
│   └── search.tsx         # 搜索页面
├── src/                   # 核心逻辑
│   ├── hooks/             # 自定义Hooks
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   └── constants/         # 常量配置
├── assets/                # 静态资源
├── docs/                  # 开发文档
└── i18n.ts               # 国际化配置
```

##  测试

```bash
# 运行单元测试
npm test

# 性能测试
npm run test:performance
```

##  构建发布

### 开发构建
```bash
# Android APK
eas build --platform android --profile development
```

### 生产构建
```bash
# Android AAB (Google Play)
eas build --platform android --profile production
```

##  贡献指南

欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件使用 React.memo 优化性能
- 功能按模块组织代码结构

## 🗺️ 开发路线图

### 已完成 ✅
- [x] 基础笔记功能
- [x] 富文本编辑器
- [x] 分类管理系统
- [x] 多格式导出
- [x] 搜索功能
- [x] 国际化支持
- [x] 性能优化
- [x] UI/UX 优化
- [x] 新用户引导笔记

### 计划中 📋
- [ ] 字号大小调整
- [ ] Task List 功能
- [ ] 段落间距调整
- [ ] 表格插入功能
- [ ] 分类拖拽排序
- [ ] 置顶动画效果
- [ ] 导出自定义设置
- [ ] 全局设置页面
- [ ] AI 助手集成
- [ ] 回收站功能
> 更多功能待定 ?

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🔒 隐私政策

我们非常重视您的隐私和数据安全：

- 📖 **[隐私政策 (中文)](privacy-policy.md)**
- 📖 **[Privacy Policy (English)](privacy-policy-en.md)**

**核心承诺**：
- ✅ 所有笔记数据完全本地存储
- ✅ 不收集任何个人信息或笔记内容
- ✅ 不追踪用户行为
- ✅ 无广告，无第三方数据分享
- ✅ 开源透明，代码可审查

##  项目目标

- 🎯 **下载量目标**: 1000+ 用户


## 关于项目

这是我第一次尝试开发移动端 App，最初的想法只是用几天时间，做一个简易的笔记应用作为练习。笔记应用可以说是移动端开发的新手经典项目，几乎所有独立开发者在学习初期都会接触它。如今的应用商店里已经充满了各种类型的笔记应用，再加上 AI 的生成能力早已超过新手阶段的开发水平，去重复造一个 AI 也能轻松做出的轮子，似乎已经失去了意义。以现在的眼光来看，做这样一个应用，或许只是一种自娱自乐。

但随着开发的深入，我遇到了许多棘手的 Bug，也经历了翻遍文档、社区、论坛、甚至开源项目却找不到任何解决方案的时刻。一周过去，我却发现，自己已经在不断想象新的功能，不断打磨细节。我开始认真地想做出一款真正好用的笔记应用，哪怕只是做出一点点差异化，哪怕只是成为一个流畅、美观、值得使用的产品，而不仅仅是一个仓促完成的练习。

为什么是笔记？因为我对笔记和备忘录应用有着天然的兴趣。我本身就是笔记应用的重度用户。笔记不仅仅是记录，更是思考的延伸。外化的思考链和记忆以文字或图像的形式呈现，免除了在脑中反复回忆的负担。一个条理清晰的笔记，远胜于漫长的苦思冥想。人类的飞跃发展，离不开书写系统的发明；而在人均拥有移动设备的今天，笔记应用已然成为了最便捷的书写工具，甚至成为了我们脑功能的延伸。

在这个项目的开发过程中，我也不断思考新的功能，不断发现可以改进的细节。受限于个人能力，有些想法暂时还无法快速实现，但我依然希望它可以成为一个有价值的产品。

如果这个项目对你有所帮助，或者你喜欢它，欢迎给我一个 ⭐️，非常感谢！

---


