// 编辑器组件 - 富文本编辑器封装
import React, { memo, useMemo, useEffect } from 'react';
import { View, useColorScheme } from 'react-native';
import { RichText } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface EditorComponentProps {
  editor: any;
  content?: string;
}

export const EditorComponent = memo<EditorComponentProps>(({ 
  editor, 
  content = ''
}) => {const colorScheme = useColorScheme() ?? 'light';

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
  }), []);

  const scrollViewContentContainerStyle = useMemo(() => ({ 
    flexGrow: 1, 
    paddingBottom: 0 
  }), []);  if (!editor) {
    return <View style={{ flex: 1, minHeight: 200 }} />;
  }

  // 注意：图片点击事件现在通过 ImageClickExtension (ProseMirror 扩展) 处理
  // 不再需要通过 JavaScript 注入的方式处理
  
  return (
    <KeyboardAwareScrollView 
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
      extraScrollHeight={40}
      showsVerticalScrollIndicator={true}
      style={{ flex: 1 }}
      contentContainerStyle={scrollViewContentContainerStyle}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      keyboardOpeningTime={250}
      enableResetScrollToCoords={false}
    >      <View style={containerStyle}>
        <RichText 
          editor={editor}
          style={richTextStyle}
          containerStyle={richTextContainerStyle}
          removeClippedSubviews={false}
        />
      </View>
    </KeyboardAwareScrollView>
  );
});
