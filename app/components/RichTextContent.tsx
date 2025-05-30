import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { styles } from './styles';
import { ExportView } from './ExportView';
import { TitleSection } from './TitleSection';
import { EditorComponent } from './EditorComponent';
import { useEditorContent } from './hooks/useEditorContent';
import { formatDate as getFormattedDate, getPlainTextLength, calculateContentHeight } from './utils/contentUtils';

interface RichTextContentProps {
  title: string;
  content: string;
  onChangeContent: (html: string) => void;
  onChangeTitle: (text: string) => void;
  noteViewRef: React.RefObject<any>;
  textColor?: string;
  editorBackgroundColor?: string;
  editorBorderColor?: string;
  maxLength?: number;
  titleError?: string;
  lastEditedAt?: number;
  editor: any;
}

export const RichTextContent: React.FC<RichTextContentProps> = ({
  title,
  content,
  onChangeContent,
  onChangeTitle,
  noteViewRef,
  textColor,
  maxLength,
  titleError,
  lastEditedAt,
  editor,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  // 使用自定义 Hook 管理编辑器内容
  const { isUpdating, getCurrentContent } = useEditorContent({
    editor,
    initialContent: content,
    onContentChange: onChangeContent,
    debounceMs: 500
  });
  
  return (
    <View style={styles.contentContainer}>
      {/* 导出视图 */}
      <ExportView
        ref={noteViewRef}
        title={title}
        content={content}
        lastEditedAt={lastEditedAt}
      />

      {/* 标题和元数据部分 */}
      <TitleSection
        title={title}
        onChangeTitle={onChangeTitle}
        lastEditedAt={lastEditedAt}
        content={content}
        textColor={textColor}
        maxLength={maxLength}
        titleError={titleError}
      />

      {/* 富文本编辑器 */}
      <EditorComponent
        editor={editor}
      />
    </View>
  );
};
