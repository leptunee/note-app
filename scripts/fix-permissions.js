const fs = require('fs');
const path = require('path');

/**
 * 权限修复脚本
 * 用于在 expo prebuild 后自动移除不需要的敏感权限
 */

const ANDROID_MANIFEST_PATH = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

function fixPermissions() {
  console.log('🔧 正在修复 Android 权限配置...');
  
  if (!fs.existsSync(ANDROID_MANIFEST_PATH)) {
    console.error('❌ AndroidManifest.xml 文件不存在，请先运行 expo prebuild');
    return false;
  }

  let manifestContent = fs.readFileSync(ANDROID_MANIFEST_PATH, 'utf8');
  let modified = false;
  
  // 检查是否需要添加 tools 命名空间
  if (!manifestContent.includes('xmlns:tools="http://schemas.android.com/tools"')) {
    manifestContent = manifestContent.replace(
      '<manifest xmlns:android="http://schemas.android.com/apk/res/android"',
      '<manifest xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools"'
    );
    modified = true;
    console.log('📝 添加了 tools 命名空间');
  }
  
  // 检查是否存在需要移除的权限
  const hasRecordAudio = manifestContent.includes('android.permission.RECORD_AUDIO') && 
                         !manifestContent.includes('android.permission.RECORD_AUDIO" tools:node="remove"');
  const hasCamera = manifestContent.includes('android.permission.CAMERA') && 
                    !manifestContent.includes('android.permission.CAMERA" tools:node="remove"');
  
  if (hasRecordAudio || hasCamera) {
    // 移除现有的权限声明（不包含 tools:node="remove" 的）
    manifestContent = manifestContent.replace(
      /<uses-permission android:name="android\.permission\.RECORD_AUDIO"\s*\/?\s*>/g,
      ''
    );
    
    manifestContent = manifestContent.replace(
      /<uses-permission android:name="android\.permission\.CAMERA"\s*\/?\s*>/g,
      ''
    );
    
    // 在第一个 uses-permission 之后添加移除指令
    const writeStorageMatch = manifestContent.match(/<uses-permission android:name="android\.permission\.WRITE_EXTERNAL_STORAGE"\s*\/?\s*>/);
    if (writeStorageMatch) {
      const insertPosition = manifestContent.indexOf(writeStorageMatch[0]) + writeStorageMatch[0].length;
      const beforeInsert = manifestContent.substring(0, insertPosition);
      const afterInsert = manifestContent.substring(insertPosition);
      
      const permissionRemovalBlock = `
  
  <!-- 明确移除不需要的敏感权限 -->
  <uses-permission android:name="android.permission.RECORD_AUDIO" tools:node="remove" />
  <uses-permission android:name="android.permission.CAMERA" tools:node="remove" />`;
      
      manifestContent = beforeInsert + permissionRemovalBlock + afterInsert;
      modified = true;
    }
  }
  
  if (modified) {
    // 写回文件
    fs.writeFileSync(ANDROID_MANIFEST_PATH, manifestContent, 'utf8');
    
    console.log('✅ Android 权限配置修复完成！');
    console.log('📝 已移除以下敏感权限：');
    console.log('   - android.permission.RECORD_AUDIO');
    console.log('   - android.permission.CAMERA');
    return true;
  } else {
    console.log('✅ 权限配置已经是正确的，无需修改');
    return true;
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  fixPermissions();
}

module.exports = { fixPermissions };
