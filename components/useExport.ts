import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Note } from './useNotes';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * 导出结果类型
 */
export interface ExportResult {
  success: boolean;
  message: string;
  htmlFilePath?: string; // 用于图片导出时的临时HTML文件路径
  fileName?: string; // 用于图片导出时的目标文件名
}

/**
 * 从 HTML 内容中提取纯文本，去除所有 HTML 标签和图片
 * @param html HTML 字符串
 * @returns 纯文本字符串
 */
const extractPlainTextFromHTML = (html: string): string => {
  if (!html) return '';
  
  // 移除图片标签（包括 base64 图片）
  let cleanText = html.replace(/<img[^>]*>/gi, '');
  
  // 移除所有 HTML 标签
  cleanText = cleanText.replace(/<[^>]*>/g, '');
  
  // 解码 HTML 实体
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // 清理多余的空白字符
  cleanText = cleanText
    .replace(/\s+/g, ' ')  // 将多个空白字符替换为单个空格
    .replace(/\n\s*\n/g, '\n\n')  // 保留段落分隔
    .trim();
  
  return cleanText;
};

/**
 * 笔记导出功能 Hook
 * 支持导出为文本文件(.txt)、Word文档(.docx)、Markdown(.md)和图片(.png)
 */
export function useExport() {
  /**
   * 将笔记导出为纯文本文件(.txt)
   * @param note 要导出的笔记
   * @returns 对象包含导出是否成功和消息
   */
  const exportAsTxt = async (note: Note): Promise<ExportResult> => {
    try {
      // 从 HTML 内容中提取纯文本
      const plainTextContent = extractPlainTextFromHTML(note.content);
      
      // 构建文件内容 - 添加更多信息
      const dateStr = new Date(note.createdAt).toLocaleString();
      const content = `标题: ${note.title}\n创建时间: ${dateStr}\n\n${plainTextContent}\n\n- 来自笔记应用`;

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
        return { success: true, message: '笔记已成功导出为文本文件。' };
      } else {
        return { success: false, message: '分享功能不可用，无法导出文本文件。' };
      }
    } catch (error) {
      console.error('导出笔记时出错:', error);
      return { success: false, message: '导出文本文件失败，请重试。' };
    }
  };

  /**
   * 将笔记导出为类Word文档（HTML格式，可在Word中打开）
   * @param note 要导出的笔记
   * @returns 对象包含导出是否成功和消息
   */
  const exportAsWord = async (note: Note): Promise<ExportResult> => {
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
        return { success: true, message: '笔记已导出为Word文档并分享成功。' };
      } else {
        return { success: false, message: '分享功能不可用，无法导出Word文档。' };
      }
    } catch (error) {
      console.error('导出Word文档时出错:', error);
      return { success: false, message: '导出Word文档失败，请重试。' };
    }
  };

  /**
   * 将笔记导出为Markdown(.md)
   * @param note 要导出的笔记
   * @returns 对象包含导出是否成功和消息
   */
  const exportAsMarkdown = async (note: Note): Promise<ExportResult> => {
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
        return { success: true, message: '笔记已导出为Markdown文件并分享成功。' };
      } else {
        return { success: false, message: '分享功能不可用，无法导出Markdown文件。' };
      }
    } catch (error) {
      console.error('导出Markdown笔记时出错:', error);
      return { success: false, message: '导出Markdown失败，请重试。' };
    }
  };  /**
   * 将笔记导出为图片(.png)
   * @param viewRef React.RefObject 需要截图的视图引用
   * @param note 要导出的笔记信息
   * @returns 对象包含导出是否成功和消息
   */
  const exportAsImage = async (viewRef: any, note: Note): Promise<ExportResult> => {
    try {
      // 请求存储权限（仅限 Android）
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('需要存储权限来保存图片');
          return { success: false, message: '需要存储权限来保存图片。' };
        }
      }

      // 截取视图为图片 - 确保捕获视图的有效性
      if (!viewRef.current) {
        console.error('视图引用无效');
        return { success: false, message: '无法获取笔记视图以截图。' };
      }

      // 临时显示导出视图以进行截图
      let totalHeight = 800; // 默认高度
      try {
        if (viewRef.current) {
          // 使用改进的高度计算逻辑，与RichTextContent.tsx保持一致
          const contentLength = note.content ? note.content.replace(/<[^>]*>/g, '').length : 0;
          const imageCount = (note.content.match(/<img[^>]*>/gi) || []).length;
          
          // 计算各种块级元素数量
          const paragraphCount = (note.content.match(/<p[^>]*>/gi) || []).length;
          const divCount = (note.content.match(/<div[^>]*>/gi) || []).length;
          const brCount = (note.content.match(/<br\s*\/?>/gi) || []).length;
          const headingCount = (note.content.match(/<h[1-6][^>]*>/gi) || []).length;
          
          // 计算列表相关元素
          const listItemCount = (note.content.match(/<li[^>]*>/gi) || []).length;
          const listCount = (note.content.match(/<[uo]l[^>]*>/gi) || []).length;
          
          // 更精确的段落计数：包括所有可能导致换行的元素
          const totalBlockElements = Math.max(1, paragraphCount + divCount + headingCount + listCount);
          
          console.log('Export content analysis:', {
            contentLength,
            imageCount,
            paragraphCount,
            divCount,
            brCount,
            headingCount,
            listItemCount,
            listCount,
            totalBlockElements
          });
          
          // 基础高度计算（与RichTextContent.tsx中calculateContentHeight函数完全相同）
          let webViewHeight = 300; // 增加基础高度
          
          // 文本高度：更保守的估算，每40个字符约一行，每行约28px
          webViewHeight += Math.ceil(contentLength / 40) * 28;
          
          // 块级元素间距：每个块级元素额外16px
          webViewHeight += totalBlockElements * 16;
          
          // 换行符：每个<br>标签额外20px
          webViewHeight += brCount * 20;
          
          // 列表项高度：每个列表项约32px（包含项目符号和间距）
          webViewHeight += listItemCount * 32;
          
          // 列表容器：每个列表额外20px的上下边距
          webViewHeight += listCount * 20;
          
          // 标题额外高度：标题通常比普通文本更高
          webViewHeight += headingCount * 20;
          
          // 图片高度：每张图片平均250px + 20px margin（更保守的估算）
          webViewHeight += imageCount * 270;
          
          // 增加50%的缓冲空间以确保完整显示
          webViewHeight = Math.ceil(webViewHeight * 1.5);
          
          // 限制在合理范围内（最小500px，最大8000px）
          webViewHeight = Math.max(500, Math.min(8000, webViewHeight));
          
          // 头部高度（约120px）+ WebView高度 + 内容区padding(32px)
          const headerHeight = 120;
          const contentPadding = 32;
          totalHeight = headerHeight + webViewHeight + contentPadding;
          
          console.log('Export view size calculation:', { 
            contentLength,
            imageCount,
            totalBlockElements,
            webViewHeight,
            headerHeight,
            totalHeight
          });

          // 设置导出视图的样式
          viewRef.current.setNativeProps({
            style: {
              position: 'absolute',
              opacity: 1,
              height: totalHeight,
              width: 450,
              left: 0,
              top: 0,
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 0,
              zIndex: 999,
              overflow: 'visible',
            }
          });
        }
        
        // 给WebView充足的时间来完全加载和渲染内容
        console.log('Waiting for WebView to fully render content...');
        
        // 基于内容复杂度动态调整等待时间，增加更长的等待时间
        const hasImages = (note.content.match(/<img[^>]*>/gi) || []).length > 0;
        const isLongContent = note.content.length > 5000;
        const isVeryLongContent = note.content.length > 10000;
        
        let waitTime = 5000; // 增加基础等待时间到5秒
        if (hasImages) waitTime += 3000; // 有图片额外加3秒
        if (isLongContent) waitTime += 3000; // 长内容额外加3秒
        if (isVeryLongContent) waitTime += 5000; // 超长内容额外加5秒
        
        console.log(`Calculated wait time: ${waitTime}ms (hasImages: ${hasImages}, isLongContent: ${isLongContent}, isVeryLongContent: ${isVeryLongContent})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } catch (error) {
        console.error('设置视图样式时出错:', error);
      }

      // 使用更安全的截图配置
      const fileName = `${note.title.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      console.log('Starting capture with optimized options...');
      
      // 使用高质量截图配置
      const base64Image = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9, // 提高质量到0.9
        result: 'base64',
      });

      // 将base64数据写入文件系统
      await FileSystem.writeAsStringAsync(
        fileUri,
        base64Image,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // 截图后恢复隐藏状态
      try {
        if (viewRef.current) {
          viewRef.current.setNativeProps({
            style: {
              position: 'absolute',
              opacity: 0,
              width: 1,
              height: 1,
              left: -9999,
              zIndex: -1
            }
          });
        }
      } catch (error) {
        console.error('恢复视图样式时出错:', error);
      }

      // Android平台保存到相册
      let savedToGallery = false;
      if (Platform.OS === 'android') {
        try {
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          const album = await MediaLibrary.getAlbumAsync('笔记应用');
          if (album === null) {
            await MediaLibrary.createAlbumAsync('笔记应用', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          savedToGallery = true;
        } catch (error) {
          console.error('保存到媒体库时出错:', error);
        }
      }

      // 验证文件是否存在
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          console.error('导出文件不存在');
          return { success: false, message: '创建的图片文件无效或无法访问。' };
        }
      } catch (error) {
        console.error('检查文件时出错:', error);
        return { success: false, message: '检查文件时出错，无法访问图片。' };
      }

      // 分享图片
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: `分享笔记图片: ${note.title}`,
            UTI: 'public.png' // 用于iOS
          });
          if (Platform.OS === 'android' && savedToGallery) {
            return { success: true, message: '图片已保存到相册并成功分享。' };
          }
          return { success: true, message: '图片已成功分享。' };
        } else {
          console.log('分享功能不可用');
          if (Platform.OS === 'android' && savedToGallery) {
            return { success: true, message: '图片已保存到相册。分享功能当前不可用。' };
          } else if (Platform.OS === 'ios') {
            return { success: false, message: '分享功能不可用，无法完成图片导出。' };
          }
          return { success: false, message: '分享功能不可用。' };
        }
      } catch (error) {
        console.error('分享图片时出错:', error);
        if (Platform.OS === 'android' && savedToGallery) {
          return { success: true, message: '图片已保存到相册，但分享失败。' };
        }
        return { success: false, message: '图片分享失败。' };
      }
    } catch (error) {
      console.error('导出笔记为图片时出错:', error);
      return { success: false, message: '导出图片失败，请重试。' };
    }
  };

  return {
    exportAsTxt,
    exportAsWord,
    exportAsMarkdown,
    exportAsImage
  };
}