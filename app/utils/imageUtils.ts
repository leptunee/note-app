// 图片处理工具函数

/**
 * 从HTML内容中提取第一张图片的URI
 * @param htmlContent HTML内容字符串
 * @returns 第一张图片的URI，如果没有图片则返回null
 */
export function extractFirstImageUri(htmlContent: string): string | null {
  if (!htmlContent) return null;
  
  // 使用正则表达式匹配img标签中的src属性
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const match = htmlContent.match(imgRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * 检查内容中是否包含图片
 * @param htmlContent HTML内容字符串
 * @returns 是否包含图片
 */
export function hasImages(htmlContent: string): boolean {
  if (!htmlContent) return false;
  return /<img[^>]*>/i.test(htmlContent);
}
