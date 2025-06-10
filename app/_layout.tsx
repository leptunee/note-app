import 'react-native-get-random-values';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
// 确保i18n初始化正确
import '../i18n';

import { useColorScheme } from '@/components/useColorScheme';

// 使用命名导出而非默认导出可以减少一些潜在问题
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // 在应用启动时立即注入全局CSS来隐藏占位符
  useEffect(() => {
    // 立即注入全局样式来隐藏占位符，防止闪烁
    const globalCSS = `
      /* 全局隐藏所有可能的占位符样式 - 立即生效 */
      .ProseMirror .is-editor-empty:first-child::before,
      .ProseMirror .is-empty::before,
      .ProseMirror [data-placeholder]::before,
      .ProseMirror::before,
      .ProseMirror .placeholder,
      .ProseMirror-placeholder,
      [data-placeholder]::before,
      .is-empty::before,
      .is-editor-empty::before,
      .placeholder::before,
      .editor-placeholder::before,
      .tentap-editor .placeholder,
      .tentap-editor::before,
      .tentap-editor [data-placeholder]::before,
      .RichTextEditor .placeholder,
      .RichTextEditor::before,
      .RichTextEditor [data-placeholder]::before {
        content: '' !important;
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    
    // 立即创建并插入全局样式
    const globalStyleId = 'global-placeholder-override';
    if (typeof document !== 'undefined') {
      let existingGlobalStyle = document.getElementById(globalStyleId);
      if (!existingGlobalStyle) {
        const globalStyle = document.createElement('style');
        globalStyle.id = globalStyleId;
        globalStyle.textContent = globalCSS;
        document.head.insertBefore(globalStyle, document.head.firstChild); // 插入到最前面
      }
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="note-edit" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        {/* 已移除modal页面 */}
      </Stack>
    </ThemeProvider>
  );
}
