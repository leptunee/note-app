# EAS Build 远程构建权限管理解决方案

## 🚨 问题分析

当使用 **EAS Build** 通过 GitHub 仓库进行远程构建时，存在以下关键问题：

### ❌ 本地脚本无效的原因
1. **EAS Build 使用 Managed Workflow**：远程构建会重新运行 `expo prebuild`
2. **本地文件被忽略**：EAS 不会使用您提交的 `android/` 文件夹内容
3. **脚本无法执行**：远程构建环境中无法运行自定义的 Node.js 脚本
4. **权限被重置**：每次构建都会从 `app.json` 和依赖包重新生成权限

## ✅ 远程构建解决方案（已实施）

### 🎯 最佳方案：通过 app.json 精确控制权限

我们已经在项目中实施了最可靠的解决方案：

#### 1. app.json 权限配置
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.READ_EXTERNAL_STORAGE", 
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.VIBRATE"
      ],
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA"
      ]
    }
  }
}
```

#### 2. expo-image-picker 插件配置
```json
{
  "plugins": [
    [
      "expo-image-picker",
      {
        "photosPermission": "The app accesses your photos to let you select background images and insert images into notes."
      }
    ]
  ]
}
```

## 🧪 验证结果

### ✅ prebuild 测试结果
运行 `expo prebuild --platform android --clean` 后的 AndroidManifest.xml：

```xml
<uses-permission android:name="android.permission.CAMERA" tools:node="remove"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### ✅ 权限检查结果
```
🔍 正在检查 Android 权限配置...
📋 权限检查报告：
================
✅ RECORD_AUDIO: 已正确配置移除指令
✅ CAMERA: 已正确配置移除指令
📝 必需权限检查：
✅ INTERNET: 存在
✅ READ_EXTERNAL_STORAGE: 存在
✅ WRITE_EXTERNAL_STORAGE: 存在
✅ SYSTEM_ALERT_WINDOW: 存在
✅ VIBRATE: 存在
📦 工具命名空间: ✅ 已配置
========================================
🎉 权限配置完全正确！
```

## 🚀 EAS Build 远程构建流程

### 1. 提交代码到 GitHub
```bash
git add .
git commit -m "配置 EAS Build 权限管理"
git push origin main
```

### 2. 使用 EAS Build 构建
```bash
# 预览构建
eas build --platform android --profile preview

# 生产构建
eas build --platform android --profile production
```

### 3. 权限验证
远程构建会自动：
- 应用 `app.json` 中的 `permissions` 和 `blockedPermissions` 配置
- 生成正确的 `tools:node="remove"` 指令
- 确保敏感权限被完全移除

## 📋 工具脚本状态

### 🔄 本地开发仍然有用
- `npm run check-permissions`：检查本地权限配置
- `npm run fix-permissions`：修复本地权限（开发测试用）
- `npm run prebuild:android`：本地构建和测试

### 🚫 远程构建中无效
- EAS Build 不会运行这些脚本
- 但权限配置通过 `app.json` 自动处理

## 💡 最佳实践

### 开发阶段
1. 使用 `npm run prebuild:android` 进行本地测试
2. 运行 `npm run check-permissions` 验证配置
3. 提交代码前确保 `app.json` 配置正确

### 发布阶段
1. 推送代码到 GitHub
2. 使用 EAS Build 进行远程构建
3. 下载 APK/AAB 文件验证权限

### 权限验证方法
1. **APK 分析**：使用 `aapt dump permissions app.apk` 检查最终权限
2. **Play Console**：上传后检查权限列表
3. **设备测试**：安装后检查应用权限要求

## 🎯 结论

**✅ 问题已解决**：通过 `app.json` 的 `blockedPermissions` 配置，EAS Build 远程构建能够：

1. **自动移除敏感权限**：RECORD_AUDIO 和 CAMERA
2. **保留必要权限**：应用正常功能所需的权限
3. **无需额外脚本**：完全依赖 Expo 的内置机制
4. **构建一致性**：本地和远程构建结果一致

**🚀 后续建议**：
- 定期验证 EAS Build 输出的权限配置
- 保持本地脚本用于开发阶段的快速验证
- 在 CI/CD 流程中集成权限检查（如果需要）
