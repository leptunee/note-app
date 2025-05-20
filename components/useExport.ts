// filepath: d:\mycode\note-app-react\noteApp\components\useExport.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Note } from './useNotes';
import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * 笔记导出功能 Hook
 * 支持导出为文本文件(.txt)、Word文档(.docx)、Markdown(.md)和图片(.png)
 */
export function useExport() {  /**
   * 将笔记导出为纯文本文件(.txt)
   * @param note 要导出的笔记
   * @returns 导出成功返回true，否则返回false
   */
  const exportAsTxt = async (note: Note): Promise<boolean> => {
    try {
      // 构建文件内容 - 添加更多信息
      const dateStr = new Date(note.createdAt).toLocaleString();
      const content = `标题: ${note.title}\n创建时间: ${dateStr}\n\n${note.content}\n\n- 来自笔记应用`;
      
      // 创建文件名 (使用时间戳避免文件名冲突)
      const fileName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.txt`;
      
      // 确定文件路径
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // 写入文件
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // 检查分享功能是否可用
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // 分享文件
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: `分享笔记: ${note.title}`,
          UTI: 'public.plain-text' // 用于iOS
        });
        return true;
      } else {
        Alert.alert('错误', '分享功能不可用');
        return false;
      }
    } catch (error) {
      console.error('导出笔记时出错:', error);
      return false;
    }
  };  /**
   * 将笔记导出为类Word文档（HTML格式，可在Word中打开）
   * @param note 要导出的笔记
   * @returns 导出成功返回true，否则返回false
   */
  const exportAsWord = async (note: Note): Promise<boolean> => {
    try {
      // 格式化内容，将换行转换为HTML段落
      const formattedContent = note.content
        .split('\n\n')
        .map(para => para.trim())
        .filter(para => para.length > 0)
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');

      // 当前日期时间
      const dateString = new Date(note.createdAt).toLocaleDateString();
      const timeString = new Date(note.createdAt).toLocaleTimeString();
      
      // 使用HTML模板创建Word兼容文档 - 增强样式和结构
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title}</title>
  <style>
    @page {
      margin: 2cm;
    }
    body {
      font-family: "Arial", "Microsoft YaHei", sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 2cm;
      background-color: #fff;
    }
    .document {
      max-width: 21cm;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 2em;
    }
    h1 {
      font-size: 24pt;
      color: #2c3e50;
      margin-bottom: 0.5em;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    .date {
      color: #7f8c8d;
      font-size: 12pt;
      margin-bottom: 2em;
    }
    .content {
      font-size: 12pt;
      text-align: justify;
    }
    .footer {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #ecf0f1;
      color: #95a5a6;
      font-size: 9pt;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="document">
    <div class="header">
      <h1>${note.title}</h1>
      <div class="date">创建于 ${dateString} ${timeString}</div>
    </div>
    
    <div class="content">
      ${formattedContent}
    </div>
    
    <div class="footer">
      此文档由笔记应用导出 - ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
      `;
      
      // 创建临时HTML文件
      const fileName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.html`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // 写入文件
      await FileSystem.writeAsStringAsync(filePath, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // 检查分享功能是否可用
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // 分享文件
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/html',
          dialogTitle: `分享Word文档: ${note.title}`,
          UTI: 'public.html' // 用于iOS
        });
        return true;
      } else {
        Alert.alert('错误', '分享功能不可用');
        return false;
      }
    } catch (error) {
      console.error('导出Word文档时出错:', error);
      return false;
    }
  };/**
   * 将笔记导出为Markdown(.md)
   * @param note 要导出的笔记
   * @returns 导出成功返回true，否则返回false
   */
  const exportAsMarkdown = async (note: Note): Promise<boolean> => {
    try {
      // 将笔记内容中的可能存在的 Markdown 格式处理一下
      const safeContent = note.content.replace(/(\n)/g, '\n\n');
      
      // 构建增强的 Markdown 内容
      const dateStr = new Date(note.createdAt).toLocaleDateString();
      const timeStr = new Date(note.createdAt).toLocaleTimeString();
      
      const content = `# ${note.title}\n\n` +
        `> *创建于 ${dateStr} ${timeStr}*\n\n` +
        `${safeContent}\n\n` +
        `---\n` +
        `*导出自笔记应用*`;
      
      // 创建文件名 (使用时间戳避免文件名冲突)
      const fileName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.md`;
      
      // 确定文件路径
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      
      // 写入文件
      await FileSystem.writeAsStringAsync(filePath, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // 检查分享功能是否可用
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // 分享文件
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/markdown',
          dialogTitle: `分享Markdown笔记: ${note.title}`,
          UTI: 'net.daringfireball.markdown' // 用于iOS
        });
        return true;
      } else {
        Alert.alert('错误', '分享功能不可用');
        return false;
      }
    } catch (error) {
      console.error('导出Markdown笔记时出错:', error);
      return false;
    }
  };  /**
   * 将笔记导出为图片(.png)
   * @param viewRef React.RefObject 需要截图的视图引用
   * @param note 要导出的笔记信息
   * @returns 导出成功返回true，否则返回false
   */
  const exportAsImage = async (viewRef: any, note: Note): Promise<boolean> => {
    try {
      // 请求存储权限（仅限 Android）
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('需要存储权限来保存图片');
          Alert.alert('权限错误', '需要存储权限来保存图片');
          return false;
        }
      }
      
      // 截取视图为图片 - 确保捕获视图的有效性
      if (!viewRef.current) {
        console.error('视图引用无效');
        Alert.alert('错误', '无法获取笔记视图');
        return false;
      }
        // 使用更安全的截图配置，避免宽高问题
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
        result: 'data-uri', // 使用data-uri避免文件类型问题
        snapshotContentContainer: false // 不使用内容容器大小
      });

      // 创建文件名
      const fileName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.png`;      if (Platform.OS === 'android') {
        try {
          // 保存到媒体库 (Android)
          const asset = await MediaLibrary.createAssetAsync(uri);
          const album = await MediaLibrary.getAlbumAsync('笔记应用');
          
          // 如果相册不存在，则创建
          if (album === null) {
            await MediaLibrary.createAlbumAsync('笔记应用', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          
          Alert.alert('成功', '图片已保存到相册"笔记应用"中');
        } catch (error) {
          console.error('保存到媒体库时出错:', error);
          // 即使媒体库保存失败，也尝试继续分享
        }
      }      // 验证URI是否有效
      if (!uri || typeof uri !== 'string') {
        console.error('生成的图片URI无效');
        return false;
      }
      
      // 分享图片
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: `分享笔记图片: ${note.title}`,
            UTI: 'public.png' // 用于iOS
          });
          return true;
        } else {
          console.log('分享功能不可用');
          Alert.alert('提示', '分享功能不可用，但图片已保存');
          return true; // 如果已保存到相册，返回true
        }
      } catch (error) {
        console.error('分享图片时出错:', error);
        Alert.alert('错误', '分享图片时出错，但图片可能已保存到相册');
        return false;
      }
    } catch (error) {
      console.error('导出笔记为图片时出错:', error);
      return false;
    }
  };

  return {
    exportAsTxt,
    exportAsWord,
    exportAsMarkdown,
    exportAsImage
  };
}