// 导出视图组件 - 用于图片导出
import React, { forwardRef, memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { 
  calculateContentHeight, 
  formatDate, 
  generateWebViewHTML, 
  webViewInjectedScript 
} from './utils/contentUtils';

interface ExportViewProps {
  title: string;
  content: string;
  lastEditedAt?: number;
}

export const ExportView = memo(
  forwardRef<View, ExportViewProps>(({
    title,
    content,
    lastEditedAt
  }, ref) => {
    const { t } = useTranslation();
    
    // 使用 useMemo 缓存计算结果
    const webViewHeight = useMemo(() => calculateContentHeight(content), [content]);
    
    // 缓存容器样式
    const containerStyle = useMemo(() => ({
      position: 'absolute' as const,
      opacity: 0,
      width: 375,
      height: 'auto' as const,
      top: -99999,
      left: -99999,
      zIndex: -999,
      backgroundColor: 'white',
      overflow: 'hidden' as const,
      pointerEvents: 'none' as const,
      elevation: 0,
      shadowOpacity: 0,
      borderRadius: 8,
      margin: 0,
      padding: 0,
    }), []);
    
    // 缓存标题头部样式
    const headerStyle = useMemo(() => [styles.noteHeader, { 
      backgroundColor: '#f8f8f8', 
      padding: 16,
      width: 375,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8
    }], []);
    
    // 缓存标题样式
    const titleStyle = useMemo(() => [styles.noteTitle, { 
      color: '#000', 
      fontSize: 20,
      fontWeight: 'bold' as const, 
      marginBottom: 4,
      flexWrap: 'wrap' as const
    }], []);
    
    // 缓存日期样式
    const dateStyle = useMemo(() => [styles.noteDate, { 
      color: '#666', 
      fontSize: 12 
    }], []);
    
    // 缓存内容区域样式
    const contentAreaStyle = useMemo(() => ({ 
      padding: 16, 
      backgroundColor: 'white', 
      width: 375,
      minHeight: webViewHeight + 32,
      flexShrink: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      overflow: 'hidden' as const
    }), [webViewHeight]);
    
    // 缓存 WebView 样式
    const webViewStyle = useMemo(() => ({ 
      height: webViewHeight,
      width: 343,
      backgroundColor: 'white',
      flex: 0
    }), [webViewHeight]);
    
    // 缓存无内容文本样式
    const noContentStyle = useMemo(() => ({ 
      color: '#888', 
      fontSize: 16, 
      fontStyle: 'italic' as const 
    }), []);
    
    // 缓存 HTML 内容
    const htmlContent = useMemo(() => ({ html: generateWebViewHTML(content) }), [content]);
    
    // 缓存格式化的日期文本
    const formattedDate = useMemo(() => {
      return lastEditedAt ? `${t('lastEdited')}: ${formatDate(lastEditedAt)}` : formatDate();
    }, [lastEditedAt, t]);

    return (
      <View 
        ref={ref} 
        collapsable={false} 
        style={containerStyle}
      >
        <View style={headerStyle}>
          <Text style={titleStyle}>
            {title || String(t('untitledNote'))}
          </Text>
          <Text style={dateStyle}>
            {formattedDate}
          </Text>
        </View>

        <View style={contentAreaStyle}>
          {content && content.trim() ? (
            <WebView
              style={webViewStyle}
              source={htmlContent}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={false}
              startInLoadingState={false}
              originWhitelist={['*']}
              onLoadEnd={() => {
                // WebView 加载完成
              }}
              onMessage={() => {}}
              injectedJavaScript={webViewInjectedScript}
            />
          ) : (
            <Text style={noContentStyle}>
              {String(t('noContent'))}
            </Text>
          )}
        </View>
      </View>
    );
  })
);
