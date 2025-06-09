// 导出视图组件 - 用于图片导出
import React, { forwardRef, memo, useMemo, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { exportStyles } from '../../shared/styles/export';
import { 
  calculateContentHeight, 
  formatDate, 
  generateWebViewHTML, 
  webViewInjectedScript 
} from '@/src/utils/contentUtils';

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
    
    // 状态管理WebView高度
    const [actualWebViewHeight, setActualWebViewHeight] = useState(() => 
      calculateContentHeight(content)
    );
    
    // 使用 useMemo 缓存初始计算结果
    const initialWebViewHeight = useMemo(() => calculateContentHeight(content), [content]);
    
    // WebView消息处理
    const handleWebViewMessage = useCallback((event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'ready' && data.contentHeight) {        // 使用实际测量的高度，并添加安全边界
          const newHeight = Math.max(data.contentHeight + 50, initialWebViewHeight);
          setActualWebViewHeight(newHeight);
        }
      } catch (error) {
        // 忽略消息处理错误
      }
    }, [initialWebViewHeight]);
    
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
    const headerStyle = useMemo(() => [exportStyles.noteHeader, { 
      backgroundColor: '#f8f8f8', 
      padding: 16,
      width: 375,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8
    }], []);
    
    // 缓存标题样式
    const titleStyle = useMemo(() => [exportStyles.noteTitle, { 
      color: '#000', 
      fontSize: 20,
      fontWeight: 'bold' as const, 
      marginBottom: 4,
      flexWrap: 'wrap' as const
    }], []);
      
    // 缓存日期样式
    const dateStyle = useMemo(() => [exportStyles.noteDate, { 
      color: '#666', 
      fontSize: 12 
    }], []);
    
    // 缓存内容区域样式 - 使用动态高�?
    const contentAreaStyle = useMemo(() => ({ 
      padding: 16, 
      backgroundColor: 'white', 
      width: 375,
      minHeight: actualWebViewHeight + 32,
      flexShrink: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      overflow: 'hidden' as const
    }), [actualWebViewHeight]);
    
    // 缓存 WebView 样式 - 使用动态高�?
    const webViewStyle = useMemo(() => ({ 
      height: actualWebViewHeight,
      width: 343,
      backgroundColor: 'white',
      flex: 0
    }), [actualWebViewHeight]);
    
    // 缓存无内容文本样�?
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
              removeClippedSubviews={false}
              scalesPageToFit={false}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo={false}
              mixedContentMode="compatibility"
              onLoadEnd={() => {
                // WebView 加载完成
              }}
              onMessage={handleWebViewMessage}
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
