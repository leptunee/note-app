// 内容高度计算工具
export function calculateContentHeight(htmlContent: string): number {
  if (!htmlContent?.trim()) return 400;

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

  // 基础高度计算
  let estimatedHeight = 300;
  estimatedHeight += Math.ceil(textLength / 40) * 28; // 文本高度
  estimatedHeight += totalBlockElements * 16; // 块级元素间距
  estimatedHeight += brCount * 20; // 换行符
  estimatedHeight += listItemCount * 32; // 列表项
  estimatedHeight += listCount * 20; // 列表容器
  estimatedHeight += headingCount * 20; // 标题额外高度
  estimatedHeight += imageCount * 270; // 图片高度

  // 增加缓冲空间
  estimatedHeight = Math.ceil(estimatedHeight * 1.5);
  
  // 限制范围
  return Math.max(500, Math.min(8000, estimatedHeight));
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
          }          img { 
            max-width: 100%; 
            width: auto;
            height: auto; 
            display: block; 
            margin: 12px 0;
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
export const webViewInjectedScript = `  const images = document.querySelectorAll('img');
  let loadedCount = 0;
  const totalImages = images.length;
  
  function ensureLayoutComplete() {
    document.body.offsetHeight;
    
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.offsetHeight === 0 && el.textContent && el.textContent.trim()) {
        el.style.minHeight = '1px';
      }
    });
    
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'ready',
      contentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight
    }));
  }
  
  if (totalImages === 0) {
    if (document.readyState === 'complete') {
      setTimeout(ensureLayoutComplete, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(ensureLayoutComplete, 100);
      });
    }
  } else {
    images.forEach((img, index) => {      if (img.complete && img.naturalHeight !== 0) {
        loadedCount++;
        if (loadedCount === totalImages) {
          setTimeout(ensureLayoutComplete, 200);
        }
      } else {
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(ensureLayoutComplete, 200);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setTimeout(ensureLayoutComplete, 200);
          }
        };
      }
    });
      setTimeout(() => {
      if (loadedCount < totalImages) {
        ensureLayoutComplete();
      }
    }, 5000);
  }
  true;
`;
