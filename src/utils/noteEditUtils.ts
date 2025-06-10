// 主题、颜色、padding 等工具函数
export const themes = [
  { id: 'default', nameKey: 'themeDefault', backgroundColor: '#ffffff', textColor: '#000000', editorBackgroundColor: '#f5f5f5', editorBorderColor: '#ddd' },
  { id: 'dark', nameKey: 'themeLight', backgroundColor: '#e8f5e9', textColor: '#1b5e20', editorBackgroundColor: '#c8e6c9', editorBorderColor: '#81c784' },
  { id: 'sepia', nameKey: 'themeSepia', backgroundColor: '#f8f1e3', textColor: '#5b4636', editorBackgroundColor: '#f0e8da', editorBorderColor: '#d8c8b6' },
  { id: 'blue', nameKey: 'themeBlue', backgroundColor: '#edf6ff', textColor: '#333333', editorBackgroundColor: '#e0f0ff', editorBorderColor: '#c0d8f0' },
];

export function getBackgroundColor(pageSettings: any, colorScheme: string) {
  if (!pageSettings) {
    return '#fff';
  }
  if (pageSettings.backgroundImageUri) {
    return 'transparent';
  }
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.backgroundColor;
  }
  // 即使在暗色模式下，也返回浅色背景
  return '#fff';
}

export function getTextColor(pageSettings: any, colorScheme: string) {
  if (!pageSettings) {
    return '#000';
  }
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.textColor;
  }
  // 始终使用深色文字，不考虑系统主题
  return '#000';
}

export function getEditorBackgroundColor(pageSettings: any, colorScheme: string) {
  if (!pageSettings) {
    return '#f5f5f5';
  }
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.editorBackgroundColor || themeDefinition.backgroundColor;
  }
  // 始终使用浅色编辑器背景，不考虑系统主题
  return '#f5f5f5';
}

export function getEditorBorderColor(pageSettings: any, colorScheme: string) {
  if (!pageSettings) {
    return '#ddd';
  }
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.editorBorderColor || '#ddd';
  }
  // 始终使用浅色边框，不考虑系统主题
  return '#ddd';
}

export function getContentPadding(marginValue: number) {
  // marginValue 直接表示像素值，范围：8px 到 40px
  const minPadding = 8;
  const maxPadding = 40;
  
  // 确保值在有效范围内
  return Math.max(minPadding, Math.min(maxPadding, marginValue));
}

// 获取编辑器遮罩的背景色 - 专门用于占位符遮罩
export function getEditorMaskColor(pageSettings: any, colorScheme: string) {
  if (!pageSettings) {
    return colorScheme === 'dark' ? '#000000' : '#ffffff';
  }
  
  // 如果有背景图片，根据图片的主色调或透明度来决定遮罩颜色
  if (pageSettings.backgroundImageUri) {
    // 对于背景图片，我们需要使用容器的背景色，而不是透明
    const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
    if (themeDefinition) {
      return themeDefinition.backgroundColor;
    }
    // 如果没有主题定义，使用默认的容器背景色
    return colorScheme === 'dark' ? '#000000' : '#ffffff';
  }
  
  // 没有背景图片时，使用编辑器背景色
  return getEditorBackgroundColor(pageSettings, colorScheme);
}
