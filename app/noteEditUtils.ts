// 主题、颜色、padding 等工具函数
export const themes = [
  { id: 'default', name: '默认', backgroundColor: '#ffffff', textColor: '#000000', editorBackgroundColor: '#f5f5f5', editorBorderColor: '#ddd' },
  { id: 'dark', name: '暗黑', backgroundColor: '#121212', textColor: '#ffffff', editorBackgroundColor: '#2c2c2c', editorBorderColor: '#404040' },
  { id: 'sepia', name: '护眼', backgroundColor: '#f8f1e3', textColor: '#5b4636', editorBackgroundColor: '#f0e8da', editorBorderColor: '#d8c8b6' },
  { id: 'blue', name: '蓝色', backgroundColor: '#edf6ff', textColor: '#333333', editorBackgroundColor: '#e0f0ff', editorBorderColor: '#c0d8f0' },
];

export function getBackgroundColor(pageSettings: any, colorScheme: string) {
  if (pageSettings.backgroundImageUri) {
    return 'transparent';
  }
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.backgroundColor;
  }
  return colorScheme === 'dark' ? '#000' : '#fff';
}

export function getTextColor(pageSettings: any, colorScheme: string) {
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.textColor;
  }
  return colorScheme === 'dark' ? '#fff' : '#000';
}

export function getEditorBackgroundColor(pageSettings: any, colorScheme: string) {
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.editorBackgroundColor || themeDefinition.backgroundColor;
  }
  return colorScheme === 'dark' ? '#333' : '#f5f5f5';
}

export function getEditorBorderColor(pageSettings: any, colorScheme: string) {
  const themeDefinition = themes.find(t => t.id === pageSettings.themeId);
  if (themeDefinition) {
    return themeDefinition.editorBorderColor || (colorScheme === 'dark' ? '#444' : '#ddd');
  }
  return colorScheme === 'dark' ? '#444' : '#ddd';
}

export function getContentPadding(marginValue: number) {
  const minPadding = 4;
  const maxPadding = 40;
  return minPadding + (marginValue / 100) * (maxPadding - minPadding);
}
