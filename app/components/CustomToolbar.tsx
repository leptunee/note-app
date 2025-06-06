import React, { memo, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';

interface CustomToolbarProps {
  editor: any;
  isVisible?: boolean;
  backgroundColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isBulletList?: boolean;
  isOrderedList?: boolean;
  onOpenDrawing?: () => void;
}

export const CustomToolbar = memo<CustomToolbarProps>(({ 
  editor, 
  isVisible = true, 
  backgroundColor,
  isBold = false,
  isItalic = false,
  isUnderline = false,
  isBulletList = false,
  isOrderedList = false,
  onOpenDrawing
}) => {
  const colorScheme = useColorScheme();

  const toolbarStyle = useMemo(() => [
    styles.toolbar,
    {
      backgroundColor: backgroundColor || (colorScheme === 'dark' ? '#2c2c2c' : '#ffffff'),
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#404040' : '#e0e0e0',
    }
  ], [backgroundColor, colorScheme]);

  const buttonStyle = useMemo(() => [
    styles.button, 
    {
      backgroundColor: colorScheme === 'dark' ? '#404040' : '#f0f0f0'
    }
  ], [colorScheme]);

  const iconColor = useMemo(() => 
    colorScheme === 'dark' ? '#ffffff' : '#333333', 
    [colorScheme]
  );

  const getButtonStyle = useCallback((isActive: boolean) => [
    styles.button,
    {
      backgroundColor: isActive 
        ? (colorScheme === 'dark' ? '#555555' : '#007AFF')
        : (colorScheme === 'dark' ? '#404040' : '#f0f0f0')
    }
  ], [colorScheme]);

  const getIconColor = useCallback((isActive: boolean) => 
    isActive 
      ? '#ffffff'
      : (colorScheme === 'dark' ? '#ffffff' : '#333333'),
    [colorScheme]
  );

  if (!isVisible) {
    return null;
  }

  const handleBold = useCallback(() => {
    try {
      if (editor && typeof editor.toggleBold === 'function') {
        editor.toggleBold();
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [editor]);

  const handleItalic = useCallback(() => {
    try {
      if (editor && typeof editor.toggleItalic === 'function') {
        editor.toggleItalic();
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [editor]);

  const handleUnderline = useCallback(() => {
    try {
      if (editor && typeof editor.toggleUnderline === 'function') {
        editor.toggleUnderline();
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [editor]);

  const handleBulletList = useCallback(() => {
    try {
      if (editor && typeof editor.toggleBulletList === 'function') {
        editor.toggleBulletList();
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [editor]);

  const handleOrderedList = useCallback(() => {
    try {
      if (editor && typeof editor.toggleOrderedList === 'function') {
        editor.toggleOrderedList();
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [editor]);

  const insertImages = useCallback(async (images: ImagePicker.ImagePickerAsset[]) => {
    if (!editor) return;

    try {
      for (const image of images) {
        let imageUri = image.uri;
        
        try {
          const base64 = await FileSystem.readAsStringAsync(image.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          const mimeType = image.type || 'image/jpeg';
          imageUri = `data:${mimeType};base64,${base64}`;
          
        } catch (conversionError) {
          // 如果转换失败，使用原始 URI
        }

        let insertSuccess = false;

        if (!insertSuccess && typeof editor.setImage === 'function') {
          try {
            editor.setImage(imageUri);
            insertSuccess = true;
          } catch (e) {
            // 尝试下一种方法
          }
        }
        
        if (!insertSuccess && editor.chain && typeof editor.chain === 'function') {
          try {
            editor.chain().focus().setImage({ src: imageUri }).run();
            insertSuccess = true;
          } catch (e) {
            // 尝试下一种方法
          }
        }
        
        if (!insertSuccess && editor.commands && typeof editor.commands.setImage === 'function') {
          try {
            editor.commands.setImage({ src: imageUri });
            insertSuccess = true;
          } catch (e) {
            // 尝试下一种方法
          }
        }

        if (!insertSuccess) {
          try {
            const imageHtml = `<img src="${imageUri}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px;" alt="插入的图片" title="插入的图片" />`;
            
            if (typeof editor.insertContent === 'function') {
              await editor.insertContent(imageHtml);
              insertSuccess = true;
            } else if (typeof editor.commands?.insertContent === 'function') {
              await editor.commands.insertContent(imageHtml);
              insertSuccess = true;
            }
          } catch (e) {
            // HTML插入失败
          }
        }

        if (!insertSuccess) {
          Alert.alert('插入失败', '当前编辑器版本不支持图片插入功能');
          return;
        }

        try {
          if (typeof editor.getHTML === 'function') {
            await editor.getHTML();
          }
        } catch (e) {
          // 静默处理验证错误
        }
      }
    } catch (error) {
      Alert.alert('插入失败', '图片插入失败，请重试');
    }
  }, [editor]);

  const handleImagePicker = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('权限被拒绝', '需要相册权限才能选择图片！');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        quality: 0.8,
        allowsMultipleSelection: true,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await insertImages(result.assets);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片时出现错误');
    }
  }, [insertImages]);

  return (
    <View style={toolbarStyle}>
      <TouchableOpacity style={getButtonStyle(isBold)} onPress={handleBold}>
        <FontAwesome 
          name="bold" 
          size={14} 
          color={getIconColor(isBold)} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={getButtonStyle(isItalic)} onPress={handleItalic}>
        <FontAwesome 
          name="italic" 
          size={14} 
          color={getIconColor(isItalic)} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={getButtonStyle(isUnderline)} onPress={handleUnderline}>
        <FontAwesome 
          name="underline" 
          size={14} 
          color={getIconColor(isUnderline)} 
        />
      </TouchableOpacity>
        
      <TouchableOpacity style={getButtonStyle(isBulletList)} onPress={handleBulletList}>
        <FontAwesome 
          name="list-ul" 
          size={14} 
          color={getIconColor(isBulletList)} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={getButtonStyle(isOrderedList)} onPress={handleOrderedList}>
        <FontAwesome 
          name="list-ol" 
          size={14} 
          color={getIconColor(isOrderedList)} 
        />
      </TouchableOpacity>
        
      <TouchableOpacity style={buttonStyle} onPress={handleImagePicker}>
        <FontAwesome 
          name="image" 
          size={14} 
          color={iconColor} 
        />
      </TouchableOpacity>
          {onOpenDrawing && (
        <TouchableOpacity style={buttonStyle} onPress={onOpenDrawing}>
          <FontAwesome 
            name="paint-brush" 
            size={14} 
            color={iconColor} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
