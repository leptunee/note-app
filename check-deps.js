#!/usr/bin/env node

// 检查未使用的依赖
const fs = require('fs');
const path = require('path');

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});

// 需要检查的文件夹
const checkDirs = ['./app', './src', './components', './constants'];

// 获取所有文件
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// 获取所有源文件
let allFiles = [];
for (const dir of checkDirs) {
  allFiles = allFiles.concat(getAllFiles(dir));
}

// 检查每个依赖是否被使用
const unusedDeps = [];
for (const dep of dependencies) {
  let isUsed = false;
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查导入语句
      const importPatterns = [
        new RegExp(`from\\s+['"]${dep}['"]`, 'g'),
        new RegExp(`import\\s+['"]${dep}['"]`, 'g'),
        new RegExp(`require\\s*\\(\\s*['"]${dep}['"]\\s*\\)`, 'g'),
        new RegExp(`@${dep.replace('/', '\\/')}`, 'g'), // 对于@开头的包
      ];
      
      if (importPatterns.some(pattern => pattern.test(content))) {
        isUsed = true;
        break;
      }
    } catch (err) {
      // 忽略读取错误
    }
  }
  
  if (!isUsed) {
    unusedDeps.push(dep);
  }
}

// 输出结果
console.log('=== 依赖使用情况分析 ===\n');
console.log(`总依赖数: ${dependencies.length}`);
console.log(`已使用: ${dependencies.length - unusedDeps.length}`);
console.log(`可能未使用: ${unusedDeps.length}\n`);

if (unusedDeps.length > 0) {
  console.log('可能未使用的依赖:');
  unusedDeps.forEach(dep => console.log(`  - ${dep}`));
  console.log('\n注意: 这只是初步分析，某些依赖可能通过其他方式被使用。');
} else {
  console.log('没有发现明显未使用的依赖。');
}
