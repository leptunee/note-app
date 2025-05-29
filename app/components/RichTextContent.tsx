import React from 'react';
import { View, Text, TextInput, useColorScheme, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WebView } from 'react-native-webview';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';


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
  editor: any; // 添加 editor prop
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
  editor, // 接收 editor 作为 prop
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
    // 计算更准确的内容高度
  const calculateContentHeight = (htmlContent: string): number => {
    if (!htmlContent || !htmlContent.trim()) return 400;
    
    // 提取纯文本长度
    const textLength = htmlContent.replace(/<[^>]*>/g, '').length;
    
    // 计算图片数量
    const imageCount = (htmlContent.match(/<img[^>]*>/gi) || []).length;
    
    // 计算各种块级元素数量
    const paragraphCount = (htmlContent.match(/<p[^>]*>/gi) || []).length;
    const divCount = (htmlContent.match(/<div[^>]*>/gi) || []).length;
    const brCount = (htmlContent.match(/<br\s*\/?>/gi) || []).length;
    const headingCount = (htmlContent.match(/<h[1-6][^>]*>/gi) || []).length;
    
    // 计算列表相关元素
    const listItemCount = (htmlContent.match(/<li[^>]*>/gi) || []).length;
    const listCount = (htmlContent.match(/<[uo]l[^>]*>/gi) || []).length;
    
    // 更精确的段落计数：包括所有可能导致换行的元素
    const totalBlockElements = Math.max(1, paragraphCount + divCount + headingCount + listCount);
    
    console.log('Content analysis:', {
      textLength,
      imageCount,
      paragraphCount,
      divCount,
      brCount,
      headingCount,
      listItemCount,
      listCount,
      totalBlockElements
    });
    
    // 基础高度计算
    let estimatedHeight = 300; // 增加基础高度
    
    // 文本高度：更保守的估算，每40个字符约一行，每行约28px（考虑行高和字体大小）
    estimatedHeight += Math.ceil(textLength / 40) * 28;
    
    // 块级元素间距：每个块级元素额外16px
    estimatedHeight += totalBlockElements * 16;
    
    // 换行符：每个<br>标签额外20px
    estimatedHeight += brCount * 20;
    
    // 列表项高度：每个列表项约32px（包含项目符号和间距）
    estimatedHeight += listItemCount * 32;
    
    // 列表容器：每个列表额外20px的上下边距
    estimatedHeight += listCount * 20;
    
    // 标题额外高度：标题通常比普通文本更高
    estimatedHeight += headingCount * 20;
    
    // 图片高度：每张图片平均250px + 20px margin（更保守的估算）
    estimatedHeight += imageCount * 270;
    
    // 增加50%的缓冲空间以确保完整显示（从20%增加到50%）
    estimatedHeight = Math.ceil(estimatedHeight * 1.5);
    
    // 限制在合理范围内（最小500px，最大8000px）
    const finalHeight = Math.max(500, Math.min(8000, estimatedHeight));
    
    console.log('Calculated height:', finalHeight);
    return finalHeight;
  };

  // 获取格式化的日期
  const getFormattedDate = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };

  // 获取纯文本内容用于字数统计
  const getPlainTextLength = (html: string) => {
    return html.replace(/<[^>]*>/g, '').length;
  };

  // 监听内容变化并保存
  const [isUpdating, setIsUpdating] = React.useState(false);
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!isUpdating && editor && typeof editor.getHTML === 'function') {
        try {
          const currentHTML = await editor.getHTML();
          if (currentHTML !== content) {
            setIsUpdating(true);
            onChangeContent(currentHTML);
            setTimeout(() => setIsUpdating(false), 500);
          }
        } catch (error) {
          // Editor not ready yet, skip this update
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editor, content, onChangeContent, isUpdating]);

  // 只在初始化时设置内容
  React.useEffect(() => {
    if (content !== undefined && editor && typeof editor.setContent === 'function' && !isUpdating) {
      const isFocused = typeof editor.isFocused === 'function' ? editor.isFocused() : false;
      if (!isFocused) {
        try {
          const currentHTML = editor.getHTML?.();
          if (currentHTML !== content && Math.abs(currentHTML?.length - content.length) > 5) {
            editor.setContent(content);
          }
        } catch (error) {
          // Failed to set editor content, skip
        }
      }
    }
  }, [content, editor, isUpdating]);
  
  // 计算WebView的高度
  const webViewHeight = calculateContentHeight(content);
  
  return (
    <View style={styles.contentContainer}>
      {/* 隐藏的导出视图 - 仅用于导出图片，支持富文本渲染 */}
      <View 
        ref={noteViewRef} 
        collapsable={false} 
        style={[
          styles.printableContent, 
          { 
            position: 'absolute', 
            opacity: 0, 
            width: 1, 
            height: 1,
            left: -9999, 
            zIndex: -1,
            backgroundColor: 'white',
            overflow: 'visible'
          }
        ]}
      >
        <View style={[styles.noteHeader, { 
          backgroundColor: '#f8f8f8', 
          padding: 16, 
          width: 450,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }]}>
          <Text style={[styles.noteTitle, { 
            color: '#000', 
            fontSize: 24, 
            fontWeight: 'bold' as const, 
            marginBottom: 4,
            flexWrap: 'wrap'
          }]}>
            {title || String(t('untitledNote'))}
          </Text>
          <Text style={[styles.noteDate, { color: '#666', fontSize: 12 }]}>
            {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
          </Text>
        </View>

        <View style={{ 
          padding: 16, 
          backgroundColor: 'white', 
          width: 450,
          minHeight: webViewHeight + 32, // 动态高度 + padding
          flexShrink: 0,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          overflow: 'visible'
        }}>
          {content && content.trim() ? (
            <WebView
              style={{ 
                height: webViewHeight,
                width: 418, // 450 - 32 padding
                backgroundColor: 'white',
                flex: 0
              }}              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
                      <style>
                        html, body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                          font-size: 16px;
                          line-height: 1.6;
                          color: #000;
                          margin: 0;
                          padding: 16px;
                          background-color: white;
                          word-wrap: break-word;
                          overflow-wrap: break-word;
                          height: auto;
                          min-height: 100%;
                          overflow: visible;
                          box-sizing: border-box;
                        }
                        body {
                          padding-bottom: 40px;
                          display: block;
                          width: 100%;
                        }
                        #content {
                          width: 100%;
                          height: auto;
                          overflow: visible;
                          min-height: 100%;
                          display: block;
                          clear: both;
                        }
                        p { 
                          margin: 0 0 16px 0; 
                          display: block;
                          clear: both;
                        }
                        div {
                          display: block;
                          margin: 0 0 12px 0;
                          clear: both;
                        }
                        img { 
                          max-width: 100%; 
                          height: auto; 
                          display: block; 
                          margin: 12px 0;
                          border-radius: 4px;
                          clear: both;
                        }
                        strong, b { font-weight: bold; }
                        em, i { font-style: italic; }
                        u { text-decoration: underline; }
                        h1, h2, h3, h4, h5, h6 { 
                          margin: 0 0 16px 0; 
                          font-weight: bold;
                          display: block;
                          clear: both;
                        }
                        h1 { font-size: 24px; line-height: 1.4; }
                        h2 { font-size: 20px; line-height: 1.4; }
                        h3 { font-size: 18px; line-height: 1.4; }
                        h4 { font-size: 16px; line-height: 1.4; }
                        h5 { font-size: 14px; line-height: 1.4; }
                        h6 { font-size: 12px; line-height: 1.4; }
                        ul, ol { 
                          margin: 0 0 16px 0; 
                          padding-left: 24px;
                          display: block;
                          clear: both;
                        }
                        li { 
                          margin-bottom: 8px;
                          display: list-item;
                          line-height: 1.6;
                        }
                        br {
                          display: block;
                          margin: 8px 0;
                          line-height: 0;
                        }
                        blockquote {
                          margin: 16px 0;
                          padding-left: 16px;
                          border-left: 4px solid #ccc;
                          font-style: italic;
                          clear: both;
                        }
                        * { 
                          box-sizing: border-box;
                          max-width: 100%;
                        }
                        /* 确保所有内容都能显示 */
                        .content-wrapper {
                          width: 100%;
                          overflow: visible;
                          display: block;
                          min-height: 100%;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="content-wrapper">
                        <div id="content">${content}</div>
                      </div>
                    </body>
                  </html>
                `
              }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={false}
              startInLoadingState={false}
              originWhitelist={['*']}
              onLoadEnd={() => {
                console.log('Export WebView loaded successfully, height:', webViewHeight);
              }}
              onMessage={() => {}}              injectedJavaScript={`
                // 等待所有图片和内容加载完成
                const images = document.querySelectorAll('img');
                let loadedCount = 0;
                const totalImages = images.length;
                
                console.log('WebView: Found', totalImages, 'images');
                
                // 确保页面布局完成
                function ensureLayoutComplete() {
                  // 强制重新计算布局
                  document.body.offsetHeight;
                  
                  // 确保所有元素都已渲染
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    if (el.offsetHeight === 0 && el.textContent && el.textContent.trim()) {
                      el.style.minHeight = '1px';
                    }
                  });
                  
                  // 通知原生端渲染完成
                  window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'ready',
                    contentHeight: document.documentElement.scrollHeight,
                    bodyHeight: document.body.scrollHeight
                  }));
                }
                
                if (totalImages === 0) {
                  // 没有图片，等待DOM加载完成
                  if (document.readyState === 'complete') {
                    setTimeout(ensureLayoutComplete, 100);
                  } else {
                    window.addEventListener('load', () => {
                      setTimeout(ensureLayoutComplete, 100);
                    });
                  }
                } else {
                  // 有图片，等待所有图片加载完成
                  images.forEach((img, index) => {
                    if (img.complete && img.naturalHeight !== 0) {
                      loadedCount++;
                      console.log('WebView: Image', index, 'already loaded');
                      if (loadedCount === totalImages) {
                        setTimeout(ensureLayoutComplete, 200);
                      }
                    } else {
                      img.onload = () => {
                        loadedCount++;
                        console.log('WebView: Image', index, 'loaded');
                        if (loadedCount === totalImages) {
                          setTimeout(ensureLayoutComplete, 200);
                        }
                      };
                      img.onerror = () => {
                        loadedCount++;
                        console.log('WebView: Image', index, 'failed to load');
                        if (loadedCount === totalImages) {
                          setTimeout(ensureLayoutComplete, 200);
                        }
                      };
                    }
                  });
                  
                  // 如果5秒后仍未完成，强制完成
                  setTimeout(() => {
                    if (loadedCount < totalImages) {
                      console.log('WebView: Timeout, forcing completion');
                      ensureLayoutComplete();
                    }
                  }, 5000);
                }
                true;
              `}
            />
          ) : (
            <Text style={{ color: '#888', fontSize: 16, fontStyle: 'italic' }}>
              {String(t('noContent'))}
            </Text>
          )}
        </View>
      </View>

      {/* 标题输入区域 */}
      <TextInput
        style={[
          {
            backgroundColor: 'transparent',
            color: textColor || (colorScheme === 'dark' ? '#fff' : '#000'),
            paddingHorizontal: 0,
            paddingVertical: 4,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 2,
          }
        ]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={onChangeTitle}
        maxLength={maxLength}
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        scrollEnabled={false}
      />

      {/* 日期和字数统计 */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 0, 
        marginBottom: 2
      }}>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {lastEditedAt ? `${t('lastEdited')}: ${getFormattedDate(lastEditedAt)}` : getFormattedDate()}
        </Text>
        <Text style={{ color: colorScheme === 'dark' ? '#999' : '#888', fontSize: 12 }}>
          {getPlainTextLength(content)} {getPlainTextLength(content) > 0 ? String(t('characters')) : String(t('character'))}
        </Text>
      </View>

      {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

      {/* 富文本编辑器 */}
      <KeyboardAwareScrollView 
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
        extraScrollHeight={40}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEnabled={true}
        keyboardOpeningTime={250}
        enableResetScrollToCoords={false}
      >
        <View style={{ 
          flex: 1,
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}>
          <RichText 
            editor={editor}
            style={{
              backgroundColor: 'transparent',
              borderWidth: 0,
              padding: 0,
              margin: 0,
              flex: 1,
              minHeight: 200,
            }}
            containerStyle={{
              backgroundColor: 'transparent',
              padding: 0,
              flex: 1,
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
