const fs = require('fs');
const path = require('path');

/**
 * 权限验证脚本
 * 用于检查 Android 应用的权限配置是否正确
 */

const ANDROID_MANIFEST_PATH = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

function checkPermissions() {
  console.log('🔍 正在检查 Android 权限配置...');
  
  if (!fs.existsSync(ANDROID_MANIFEST_PATH)) {
    console.error('❌ AndroidManifest.xml 文件不存在');
    return false;
  }

  const manifestContent = fs.readFileSync(ANDROID_MANIFEST_PATH, 'utf8');
  
  // 检查是否包含敏感权限
  const hasRecordAudio = manifestContent.includes('android.permission.RECORD_AUDIO');
  const hasCamera = manifestContent.includes('android.permission.CAMERA');
  const hasRecordAudioRemove = manifestContent.includes('android.permission.RECORD_AUDIO" tools:node="remove"');
  const hasCameraRemove = manifestContent.includes('android.permission.CAMERA" tools:node="remove"');
  
  console.log('\n📋 权限检查报告：');
  console.log('================');
  
  // 检查录音权限
  if (hasRecordAudio && hasRecordAudioRemove) {
    console.log('✅ RECORD_AUDIO: 已正确配置移除指令');
  } else if (hasRecordAudio && !hasRecordAudioRemove) {
    console.log('❌ RECORD_AUDIO: 存在权限但未配置移除指令');
  } else if (!hasRecordAudio && hasRecordAudioRemove) {
    console.log('✅ RECORD_AUDIO: 已移除且有移除指令');
  } else {
    console.log('✅ RECORD_AUDIO: 不存在（正确）');
  }
  
  // 检查相机权限
  if (hasCamera && hasCameraRemove) {
    console.log('✅ CAMERA: 已正确配置移除指令');
  } else if (hasCamera && !hasCameraRemove) {
    console.log('❌ CAMERA: 存在权限但未配置移除指令');
  } else if (!hasCamera && hasCameraRemove) {
    console.log('✅ CAMERA: 已移除且有移除指令');
  } else {
    console.log('✅ CAMERA: 不存在（正确）');
  }
  
  // 检查必需权限
  const requiredPermissions = [
    'android.permission.INTERNET',
    'android.permission.READ_EXTERNAL_STORAGE', 
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.VIBRATE'
  ];
  
  console.log('\n📝 必需权限检查：');
  requiredPermissions.forEach(permission => {
    const hasPermission = manifestContent.includes(permission) && 
                         !manifestContent.includes(`${permission}" tools:node="remove"`);
    console.log(`${hasPermission ? '✅' : '❌'} ${permission.split('.').pop()}: ${hasPermission ? '存在' : '缺失'}`);
  });
  
  // 检查 tools 命名空间
  const hasToolsNamespace = manifestContent.includes('xmlns:tools="http://schemas.android.com/tools"');
  console.log(`\n📦 工具命名空间: ${hasToolsNamespace ? '✅ 已配置' : '❌ 缺失'}`);
  
  // 总结
  const hasIssues = (hasRecordAudio && !hasRecordAudioRemove) || 
                    (hasCamera && !hasCameraRemove) || 
                    !hasToolsNamespace ||
                    !requiredPermissions.every(perm => 
                      manifestContent.includes(perm) && 
                      !manifestContent.includes(`${perm}" tools:node="remove"`)
                    );
  
  console.log('\n' + '='.repeat(40));
  if (hasIssues) {
    console.log('⚠️  发现权限配置问题，建议运行: npm run fix-permissions');
    return false;
  } else {
    console.log('🎉 权限配置完全正确！');
    return true;
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  checkPermissions();
}

module.exports = { checkPermissions };
