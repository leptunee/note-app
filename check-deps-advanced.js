const fs = require('fs');
const path = require('path');

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = packageJson.dependencies || {};

// 需要检查的文件扩展名
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.kt', '.java', '.swift', '.m', '.mm'];

// 特殊依赖检查规则
const specialRules = {
  'expo-dev-client': {
    // 开发工具客户端，在开发环境使用
    checkFiles: ['app.json', 'expo.json'],
    checkContent: ['developmentClient', 'dev-client'],
    required: 'development'
  },
  'expo-linking': {
    // Deep linking 支持，可能通过 expo-router 间接使用
    checkFiles: ['app.json', 'expo.json'],  
    checkContent: ['scheme', 'expo-router'],
    required: 'expo-router'
  },
  'expo-status-bar': {
    // 状态栏管理，已确认在使用
    confirmed: true
  },
  'expo-system-ui': {
    // 系统UI相关，可能被Expo隐式使用
    checkFiles: ['app.json'],
    checkContent: ['userInterfaceStyle', 'statusBarStyle'],
    required: 'expo-config'
  },
  'i18next': {
    // 国际化，已确认在使用
    confirmed: true
  },
  'react-dom': {
    // Web平台支持
    checkFiles: ['app.json', 'expo.json'],
    checkContent: ['web'],
    required: 'web-support'
  },
  'react-native-screens': {
    // 导航屏幕优化，被react-navigation使用
    checkContent: ['@react-navigation'],
    required: 'react-navigation'
  },
  'react-native-web': {
    // Web平台支持
    checkFiles: ['app.json', 'expo.json'],
    checkContent: ['web'],
    required: 'web-support'
  }
};

// 获取所有需要检查的文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和其他不需要检查的目录
      if (!['node_modules', '.git', '.expo', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // 检查文件扩展名
      if (extensions.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// 检查依赖是否被使用
function checkDependencyUsage(depName, files) {
  // 检查特殊规则
  const rule = specialRules[depName];
  if (rule) {
    if (rule.confirmed) {
      return { used: true, reason: '已确认使用' };
    }
    
    // 检查特定文件和内容
    if (rule.checkFiles) {
      for (const fileName of rule.checkFiles) {
        const filePath = path.join('./', fileName);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (rule.checkContent && rule.checkContent.some(pattern => content.includes(pattern))) {
            return { used: true, reason: `${rule.required} 需要` };
          }
        }
      }
    }
    
    // 检查间接依赖
    if (rule.checkContent) {
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (rule.checkContent.some(pattern => content.includes(pattern))) {
            return { used: true, reason: `${rule.required} 需要` };
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }
  }

  // 标准检查模式
  const patterns = [
    new RegExp(`import.*from\\s+['"\`]${depName}['"\`]`, 'g'),
    new RegExp(`import\\s+['"\`]${depName}['"\`]`, 'g'),
    new RegExp(`require\\s*\\(\\s*['"\`]${depName}['"\`]\\s*\\)`, 'g'),
    new RegExp(`from\\s+['"\`]${depName}/`, 'g'),
    new RegExp(`require\\s*\\(\\s*['"\`]${depName}/`, 'g'),
  ];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          return { used: true, reason: '直接引用' };
        }
      }
    } catch (error) {
      // 忽略读取错误
    }
  }
  
  return { used: false, reason: '未找到引用' };
}

// 主程序
const files = getAllFiles('./');
const usedDeps = [];
const unusedDeps = [];
const analysisResults = {};

console.log('=== 依赖使用情况详细分析 ===');

Object.keys(dependencies).forEach(dep => {
  const result = checkDependencyUsage(dep, files);
  analysisResults[dep] = result;
  
  if (result.used) {
    usedDeps.push(dep);
  } else {
    unusedDeps.push(dep);
  }
});

console.log(`总依赖数: ${Object.keys(dependencies).length}`);
console.log(`已使用: ${usedDeps.length}`);
console.log(`未使用: ${unusedDeps.length}`);

if (unusedDeps.length > 0) {
  console.log('\n=== 未使用的依赖 ===');
  unusedDeps.forEach(dep => {
    console.log(`❌ ${dep} - ${analysisResults[dep].reason}`);
  });
}

if (usedDeps.length > 0) {
  console.log('\n=== 特殊依赖说明 ===');
  const specialDeps = usedDeps.filter(dep => specialRules[dep]);
  specialDeps.forEach(dep => {
    console.log(`✅ ${dep} - ${analysisResults[dep].reason}`);
  });
}

// 提供清理建议
if (unusedDeps.length > 0) {
  console.log('\n=== 清理建议 ===');
  console.log('可以安全移除的依赖:');
  const safeToRemove = unusedDeps.filter(dep => !specialRules[dep]);
  safeToRemove.forEach(dep => {
    console.log(`npm uninstall ${dep}`);
  });
  
  if (safeToRemove.length === 0) {
    console.log('暂无可安全移除的依赖。建议进一步手动验证。');
  }
}
