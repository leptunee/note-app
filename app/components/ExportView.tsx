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
}, ref) => {  const { t } = useTranslation();
  const webViewHeight = calculateContentHeight(content);

  return (
    <View 
      ref={ref} 
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
      {/* 标题头部 */}
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
          {lastEditedAt ? `${t('lastEdited')}: ${formatDate(lastEditedAt)}` : formatDate()}
        </Text>
      </View>

      {/* 内容区域 */}
      <View style={{ 
        padding: 16, 
        backgroundColor: 'white', 
        width: 450,
        minHeight: webViewHeight + 32,
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
            }}
            source={{ html: generateWebViewHTML(content) }}
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
