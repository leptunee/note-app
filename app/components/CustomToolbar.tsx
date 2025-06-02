import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';

interface CustomToolbarProps {
  editor: any;
  isVisible?: boolean; // 新增可见性控制
  backgroundColor?: string; // 新增背景色控制
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({ 
  editor, 
  isVisible = true, 
  backgroundColor 
}) => {
  const colorScheme = useColorScheme();

  // 如果不可见，直接返回null
  if (!isVisible) {
    return null;
  }
  const handleBold = () => {
    try {
      if (editor && typeof editor.toggleBold === 'function') {
        editor.toggleBold();
      }
    } catch (error) {
      console.warn('Bold toggle failed:', error);
    }
  };

  const handleItalic = () => {
    try {
      if (editor && typeof editor.toggleItalic === 'function') {
        editor.toggleItalic();
      }
    } catch (error) {
      console.warn('Italic toggle failed:', error);
    }
  };

  const handleUnderline = () => {
    try {
      if (editor && typeof editor.toggleUnderline === 'function') {
        editor.toggleUnderline();
      }
    } catch (error) {
      console.warn('Underline toggle failed:', error);
    }
  };

  const handleBulletList = () => {
    try {
      if (editor && typeof editor.toggleBulletList === 'function') {
        editor.toggleBulletList();
      }
    } catch (error) {
      console.warn('Bullet list toggle failed:', error);
    }
  };  const insertImages = async (images: ImagePicker.ImagePickerAsset[]) => {
    if (!editor) return;

    try {
      for (const image of images) {
        // 将图片转换为 base64 格式
        let imageUri = image.uri;
        
        try {
          // 读取图片文件并转换为 base64
          const base64 = await FileSystem.readAsStringAsync(image.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
            // 获取图片的 MIME 类型
          const mimeType = image.type || 'image/jpeg';
          imageUri = `data:${mimeType};base64,${base64}`;
          
        } catch (conversionError) {
          console.warn('Failed to convert to base64, using original URI:', conversionError);
          // 如果转换失败，使用原始 URI
        }// 尝试多种插入方法
        let insertSuccess = false;
        
        // 方法1: 使用正确的 setImage API (根据文档，setImage 只接受 string 参数)
        if (!insertSuccess && typeof editor.setImage === 'function') {
          try {
            editor.setImage(imageUri);
            insertSuccess = true;
            console.log('Image inserted successfully using setImage API');
          } catch (e) {
            console.log('setImage failed, trying next method:', e);
          }
        }
        
        // 方法2: 使用 chain API with correct parameters
        if (!insertSuccess && editor.chain && typeof editor.chain === 'function') {
          try {
            editor.chain().focus().setImage({ src: imageUri }).run();
            insertSuccess = true;
            console.log('Image inserted successfully using chain API');
          } catch (e) {
            console.log('Chain API failed, trying next method:', e);
          }
        }
        
        // 方法3: 使用 commands.setImage
        if (!insertSuccess && editor.commands && typeof editor.commands.setImage === 'function') {
          try {
            editor.commands.setImage({ src: imageUri });
            insertSuccess = true;
            console.log('Image inserted successfully using commands.setImage');
          } catch (e) {
            console.log('commands.setImage failed, trying next method:', e);
          }
        }
          // 方法4: 使用 HTML 插入
        if (!insertSuccess) {
          try {
            const imageHtml = `<img src="${imageUri}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px;" alt="插入的图片" title="插入的图片" />`;
            
            if (typeof editor.insertContent === 'function') {
              await editor.insertContent(imageHtml);
              insertSuccess = true;
              console.log('Image inserted successfully using insertContent');
            } else if (typeof editor.commands?.insertContent === 'function') {
              await editor.commands.insertContent(imageHtml);
              insertSuccess = true;
              console.log('Image inserted successfully using commands.insertContent');
            }
          } catch (e) {
            console.log('HTML insertion failed:', e);
          }
        }
          if (!insertSuccess) {
          console.warn('All image insertion methods failed');
          Alert.alert('插入失败', '当前编辑器版本不支持图片插入功能');
          return;
        }        // 检查编辑器内容以验证图片是否插入成功
        try {
          console.log('Editor object keys:', Object.keys(editor));
          console.log('Editor available methods:', Object.getOwnPropertyNames(editor).filter(prop => typeof editor[prop] === 'function'));
          
          // 尝试不同的内容获取方法 (这些都是异步方法)
          if (typeof editor.getHTML === 'function') {
            const htmlContent = await editor.getHTML();
            console.log('getHTML result:', htmlContent);
          }
          
          if (typeof editor.getJSON === 'function') {
            const jsonContent = await editor.getJSON();
            console.log('getJSON result:', jsonContent);
          }
          
          if (typeof editor.getText === 'function') {
            const textContent = await editor.getText();
            console.log('getText result:', textContent);
          }
        } catch (e) {
          console.log('Failed to get editor content:', e);
        }
      }
    } catch (error) {
      console.error('Failed to insert images:', error);
      Alert.alert('插入失败', '图片插入失败，请重试');
    }
  };

  const handleImagePicker = async () => {
    try {
      // 请求相册权限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('权限被拒绝', '需要相册权限才能选择图片！');
        return;
      }      // 选择图片 - 暂时使用原有API，忽略废弃警告
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        quality: 0.8,
        allowsMultipleSelection: true, // 支持多选
        base64: false, // 不需要base64，使用文件URI
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // 处理选中的图片
        await insertImages(result.assets);
      }
    } catch (error) {
      console.error('Image picker failed:', error);
      Alert.alert('错误', '选择图片时出现错误');
    }
  };  return (
    <View style={[
      styles.toolbar,
      {
        backgroundColor: backgroundColor || (colorScheme === 'dark' ? '#2c2c2c' : '#ffffff'),
        borderTopWidth: 1,
        borderTopColor: colorScheme === 'dark' ? '#404040' : '#e0e0e0',
      }
    ]}>
      <TouchableOpacity style={[styles.button, {
        backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
      }]} onPress={handleBold}>
        <Text style={[styles.buttonText, {
          color: colorScheme === 'dark' ? '#ffffff' : '#333333'
        }]}>B</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {
        backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
      }]} onPress={handleItalic}>
        <Text style={[styles.buttonText, { 
          fontStyle: 'italic',
          color: colorScheme === 'dark' ? '#ffffff' : '#333333'
        }]}>I</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {
        backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
      }]} onPress={handleUnderline}>
        <Text style={[styles.buttonText, { 
          textDecorationLine: 'underline',
          color: colorScheme === 'dark' ? '#ffffff' : '#333333'
        }]}>U</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {
        backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
      }]} onPress={handleBulletList}>
        <Text style={[styles.buttonText, {
          color: colorScheme === 'dark' ? '#ffffff' : '#333333'
        }]}>•</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, {
        backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
      }]} onPress={handleImagePicker}>
        <FontAwesome 
          name="image" 
          size={16} 
          color={colorScheme === 'dark' ? '#ffffff' : '#333333'} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
