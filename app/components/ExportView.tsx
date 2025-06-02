// 导出视图组件 - 用于图片导出
import React, { forwardRef } from 'react';
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

export const ExportView = forwardRef<View, ExportViewProps>(({
  title,
  content,
  lastEditedAt
}, ref) => {
  const { t } = useTranslation();
  const webViewHeight = calculateContentHeight(content);  return (
    <View 
      ref={ref} 
      collapsable={false} 
      style={{
        position: 'absolute',
        opacity: 0,
        width: 375,
        height: 'auto',
        top: -99999,
        left: -99999,
        zIndex: -999,
        backgroundColor: 'white',
        overflow: 'hidden',
        pointerEvents: 'none',
        elevation: 0,
        shadowOpacity: 0,
        borderRadius: 8,
        // 确保不受父容器影响
        margin: 0,
        padding: 0,
      }}
    >{/* 标题头部 */}
      <View style={[styles.noteHeader, { 
        backgroundColor: '#f8f8f8', 
        padding: 16, 
        width: 375, // 与容器宽度保持一致
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
          {lastEditedAt ? `${t('lastEdited')}: ${formatDate(lastEditedAt)}` : formatDate()}
        </Text>
      </View>      {/* 内容区域 */}
      <View style={{ 
        padding: 16, 
        backgroundColor: 'white', 
        width: 375, // 与标题头部保持一致
        minHeight: webViewHeight + 32,
        flexShrink: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden'
      }}>        {content && content.trim() ? (
          <WebView
            style={{ 
              height: webViewHeight,
              width: 343, // 375 - 32 padding
              backgroundColor: 'white',
              flex: 0
            }}
            source={{ html: generateWebViewHTML(content) }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled={true}
            domStorageEnabled={false}
            startInLoadingState={false}            originWhitelist={['*']}
            onLoadEnd={() => {
              // WebView 加载完成
            }}
            onMessage={() => {}}
            injectedJavaScript={webViewInjectedScript}
          />
        ) : (        <Text style={{ color: '#888', fontSize: 16, fontStyle: 'italic' }}>
            {String(t('noContent'))}
          </Text>
        )}
      </View>
    </View>
  );
});
