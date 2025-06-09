// 内容高度计算工具
export function calculateContentHeight(htmlContent: string): number {
  if (!htmlContent?.trim()) return 500;

  // 提取各种元素数量
  const textLength = htmlContent.replace(/<[^>]*>/g, '').length;
  const imageCount = (htmlContent.match(/<img[^>]*>/gi) || []).length;
  const paragraphCount = (htmlContent.match(/<p[^>]*>/gi) || []).length;
  const divCount = (htmlContent.match(/<div[^>]*>/gi) || []).length;
  const brCount = (htmlContent.match(/<br\s*\/?>/gi) || []).length;
  const headingCount = (htmlContent.match(/<h[1-6][^>]*>/gi) || []).length;
  const listItemCount = (htmlContent.match(/<li[^>]*>/gi) || []).length;
  const listCount = (htmlContent.match(/<[uo]l[^>]*>/gi) || []).length;

  const totalBlockElements = Math.max(1, paragraphCount + divCount + headingCount + listCount);

  // 基础高度计算 - 更保守的估算
  let estimatedHeight = 350; // 增加基础高度
  
  // 文本高度：更精确的计算
  const averageCharsPerLine = 42;
  const lineHeight = 26;
  const textLines = Math.ceil(textLength / averageCharsPerLine);
  estimatedHeight += textLines * lineHeight;
  
  // 块级元素间距
  estimatedHeight += totalBlockElements * 18;
  
  // 换行符
  estimatedHeight += brCount * 18;
  
  // 列表项高度
  estimatedHeight += listItemCount * 30;
  
  // 列表容器高度
  estimatedHeight += listCount * 20;
  
  // 标题额外高度
  estimatedHeight += headingCount * 24;
  
  // 图片高度：为每张图片预留更多空间
  if (imageCount > 0) {
    // 基础图片高度 + 边距
    const avgImageHeight = 350;
    const imageMargin = 32; // 16px * 2 (上下边距)
    estimatedHeight += imageCount * (avgImageHeight + imageMargin);
  }

  // 动态调整缓冲空间
  let bufferMultiplier = 1.3; // 增加基础缓冲倍数
  if (imageCount > 0) {
    bufferMultiplier = 1.5; // 有图片时增加更多缓冲
  } else if (textLength > 5000) {
    bufferMultiplier = 1.25; // 长文本时适当增加缓冲
  }
  
  estimatedHeight = Math.ceil(estimatedHeight * bufferMultiplier);
  
  // 限制范围，确保最小高度足够
  return Math.max(600, Math.min(10000, estimatedHeight));
}

// 格式化日期工具
export function formatDate(timestamp?: number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

// 获取纯文本长度
export function getPlainTextLength(html: string): number {
  return html.replace(/<[^>]*>/g, '').length;
}

// WebView HTML 模板生成
export function generateWebViewHTML(content: string): string {
  return `
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
          }          body {
            padding-bottom: 16px; // 减少底部padding避免过多空白
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
          }          img { 
            max-width: 100%; 
            width: auto;
            height: auto; 
            display: block; 
            margin: 16px 0; // 增加图片上下边距确保完整显示
            border-radius: 4px;
            clear: both;
            object-fit: contain;
            box-sizing: border-box;
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
  `;
}

// WebView 注入脚本
export const webViewInjectedScript = `
  let isReady = false;
  let heightCheckCount = 0;
  const maxHeightChecks = 15;
  let lastHeight = 0;
  
  function getActualContentHeight() {
    // 强制重新计算布局
    document.body.offsetHeight;
    document.documentElement.offsetHeight;
    
    // 确保所有元素都有正确的高度
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.offsetHeight === 0 && el.textContent && el.textContent.trim()) {
        el.style.minHeight = '1px';
      }
    });
    
    // 特别处理图片元素
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.naturalHeight > 0) {
        img.style.height = 'auto';
        img.style.maxHeight = 'none';
        img.style.display = 'block';
        img.style.margin = '16px 0';
        img.style.clear = 'both';
      }
    });
    
    // 再次强制重新计算布局
    document.body.offsetHeight;
    document.documentElement.offsetHeight;
    
    // 获取多个高度值并取最大值
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight
    );
    
    return scrollHeight;
  }
  
  function checkContentReady() {
    if (isReady) return;
    
    heightCheckCount++;
    const currentHeight = getActualContentHeight();
    
    // 检查高度是否稳定
    setTimeout(() => {
      const newHeight = getActualContentHeight();
      const heightDiff = Math.abs(newHeight - lastHeight);
      const currentDiff = Math.abs(newHeight - currentHeight);
      
      // 如果高度稳定（连续两次检查差异小于10px）或达到最大检查次数
      if ((heightDiff < 10 && currentDiff < 10) || heightCheckCount >= maxHeightChecks) {
        isReady = true;
        const finalHeight = Math.max(currentHeight, newHeight, lastHeight);
        
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'ready',
          contentHeight: finalHeight + 50, // 添加额外的安全边距
          bodyHeight: document.body.scrollHeight,
          checkCount: heightCheckCount,
          finalHeight: finalHeight
        }));
      } else if (heightCheckCount < maxHeightChecks) {
        lastHeight = newHeight;
        setTimeout(checkContentReady, 250); // 增加检查间隔
      }
    }, 150);
  }
  
  // 处理图片加载
  const images = document.querySelectorAll('img');
  let loadedImageCount = 0;
  const totalImages = images.length;
  
  function onImageLoaded() {
    loadedImageCount++;
    if (loadedImageCount >= totalImages) {
      // 所有图片加载完成后，等待一段时间让布局稳定
      setTimeout(checkContentReady, 400);
    }
  }
  
  if (totalImages === 0) {
    // 没有图片，等待DOM加载完成后检查内容
    if (document.readyState === 'complete') {
      setTimeout(checkContentReady, 300);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkContentReady, 300);
      });
    }
  } else {
    // 有图片，等待所有图片加载完成
    images.forEach((img) => {
      if (img.complete && img.naturalHeight > 0) {
        onImageLoaded();
      } else {
        img.onload = onImageLoaded;
        img.onerror = () => {
          console.log('Image failed to load:', img.src);
          onImageLoaded(); // 即使加载失败也要继续
        };
      }
    });
    
    // 设置超时保护，防止长时间等待
    setTimeout(() => {
      if (!isReady) {
        console.log('Timeout: forcing content ready check');
        checkContentReady();
      }
    }, 8000);
  }
  
  true;
`;
