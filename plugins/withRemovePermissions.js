const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo 配置插件：移除敏感权限
 * 适用于 EAS Build 远程构建环境
 * 
 * 这个插件会在 prebuild 过程中自动移除不需要的敏感权限
 */
function withRemovePermissions(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    if (!androidManifest.manifest) {
      console.log('⚠️  AndroidManifest.xml manifest node not found');
      return config;
    }

    // 确保有 uses-permission 数组
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    let permissions = androidManifest.manifest['uses-permission'];
    
    console.log('🔧 正在应用权限移除插件...');
    
    // 移除录音权限
    const initialLength = permissions.length;
    permissions = permissions.filter(
      (perm) => {
        if (perm && perm.$ && perm.$['android:name'] === 'android.permission.RECORD_AUDIO') {
          console.log('❌ 移除权限: RECORD_AUDIO');
          return false;
        }
        return true;
      }
    );

    // 移除相机权限
    permissions = permissions.filter(
      (perm) => {
        if (perm && perm.$ && perm.$['android:name'] === 'android.permission.CAMERA') {
          console.log('❌ 移除权限: CAMERA');
          return false;
        }
        return true;
      }
    );

    // 确保添加了 tools 命名空间
    if (!androidManifest.manifest.$) {
      androidManifest.manifest.$ = {};
    }
    androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // 添加明确的权限移除指令
    const permissionsToRemove = [
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA'
    ];

    permissionsToRemove.forEach((permission) => {
      // 检查是否已存在移除指令
      const existingRemove = permissions.find(
        (perm) => perm && perm.$ && 
                  perm.$['android:name'] === permission && 
                  perm.$['tools:node'] === 'remove'
      );
      
      if (!existingRemove) {
        console.log(`✅ 添加移除指令: ${permission.split('.').pop()}`);
        permissions.push({
          $: {
            'android:name': permission,
            'tools:node': 'remove'
          }
        });
      }
    });

    // 更新权限列表
    androidManifest.manifest['uses-permission'] = permissions;

    console.log('✅ 权限移除插件应用完成');
    
    return config;
  });
}

module.exports = withRemovePermissions;
