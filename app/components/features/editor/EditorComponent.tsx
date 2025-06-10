// 编辑器组件 - 富文本编辑器封装
import React, { memo, useMemo, useEffect } from 'react';
import { View, useColorScheme, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RichText, useBridgeState } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface EditorComponentProps {
  editor: any;
  content?: string;
  isToolbarVisible?: boolean;
  isKeyboardVisible?: boolean;
}

export const EditorComponent = memo<EditorComponentProps>(({ 
  editor, 
  content = '',
  isToolbarVisible = false,
  isKeyboardVisible = false
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
    // 获取编辑器状态
  const editorState = useBridgeState(editor);
  const isReady = editorState?.isReady || false;  // 通过 CSS 注入来彻底隐藏占位符
  useEffect(() => {
    if (editor && isReady) {
      try {
        // 延迟一下确保编辑器完全加载
        const timer = setTimeout(() => {
          // 尝试通过编辑器 API 设置空占位符
          if (typeof editor.setPlaceholder === 'function') {
            editor.setPlaceholder('');
          }
          
          if (editor.commands && typeof editor.commands.setPlaceholder === 'function') {
            editor.commands.setPlaceholder('');
          }

          // 通过 WebView 注入 CSS 来隐藏占位符
          if (editor.webviewRef && editor.webviewRef.current && editor.webviewRef.current.injectJavaScript) {
            const hideCSS = `
              (function() {
                var style = document.createElement('style');
                style.textContent = \`
                  .ProseMirror p.is-editor-empty:first-child::before,
                  .ProseMirror [data-placeholder]:before,
                  .ProseMirror .placeholder,
                  [data-placeholder]::before {
                    display: none !important;
                    content: '' !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                  }
                \`;
                document.head.appendChild(style);
              })();
            `;
            
            editor.webviewRef.current.injectJavaScript(hideCSS);
          }
        }, 200); // 延迟200ms确保编辑器完全初始化

        return () => clearTimeout(timer);
      } catch (error) {
        console.log('Placeholder hiding attempt failed:', error);
      }
    }
  }, [editor, isReady]);

  // 缓存样式计算
  const containerStyle = useMemo(() => ({ 
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  }), []);

  const richTextStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    flex: 1,
    minHeight: 200,
  }), []);

  const richTextContainerStyle = useMemo(() => ({
    backgroundColor: 'transparent',
    padding: 0,
    flex: 1,
  }), []);  const scrollViewContentContainerStyle = useMemo(() => ({ 
    flexGrow: 1, 
    paddingBottom: 0 // 移除固定的底部内边距
  }), []);  if (!editor) {
    return (
      <View style={{ flex: 1, minHeight: 200, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colorScheme === 'dark' ? '#ffffff' : '#000000', opacity: 0.6 }}>
          {t('initializingEditor')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView 
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
      extraScrollHeight={40} // 工具栏可见时增加滚动高度
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={scrollViewContentContainerStyle}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      keyboardOpeningTime={250}
      enableResetScrollToCoords={false}
    >
      <View style={containerStyle}>
        <RichText 
          editor={editor}
          style={richTextStyle}
          containerStyle={richTextContainerStyle}
          removeClippedSubviews={false}
          placeholder=""
        />
        {/* 工具栏占位符，仅在工具栏可见但键盘不可见时显示 */}
        {isToolbarVisible && !isKeyboardVisible && (
          <View style={{ height: 48, backgroundColor: 'transparent' }} />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
});
