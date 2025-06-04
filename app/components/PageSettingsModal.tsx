import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  useColorScheme,
  Platform,
  Dimensions,
  ImageBackground
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { PageSettings } from '@/components/useNotes';
import { styles } from './styles';

interface PageTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  editorBackgroundColor?: string;
  editorBorderColor?: string;
}

interface PageSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentSettings: PageSettings;
  onSettingsChange: (settings: Partial<PageSettings>) => void;
}

interface AspectRatioOption {
  id: string;
  name: string;
  value: [number, number];
}

const themes: PageTheme[] = [
  { id: 'default', name: '默认', backgroundColor: '#ffffff', textColor: '#000000', editorBackgroundColor: '#f5f5f5', editorBorderColor: '#ddd' },
  { id: 'dark', name: '暗黑', backgroundColor: '#121212', textColor: '#ffffff', editorBackgroundColor: '#2c2c2c', editorBorderColor: '#404040' },
  { id: 'sepia', name: '护眼', backgroundColor: '#f8f1e3', textColor: '#5b4636', editorBackgroundColor: '#f0e8da', editorBorderColor: '#d8c8b6' },
  { id: 'blue', name: '蓝色', backgroundColor: '#edf6ff', textColor: '#333333', editorBackgroundColor: '#e0f0ff', editorBorderColor: '#c0d8f0' },
];

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isVisible,
  onClose,
  currentSettings,
  onSettingsChange
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const screenHeight = Dimensions.get('window').height;
  
  // 定义裁切比例选项
  const aspectRatioOptions: AspectRatioOption[] = [
    { id: 'original', name: '原始比例', value: [0, 0] },
    { id: '1:1', name: '1:1 (正方形)', value: [1, 1] },
    { id: '4:3', name: '4:3 (经典)', value: [4, 3] },
    { id: '16:9', name: '16:9 (宽屏)', value: [16, 9] },
    { id: '3:4', name: '3:4 (竖屏)', value: [3, 4] },
    { id: '9:16', name: '9:16 (全屏)', value: [9, 16] },
  ];
  
  // 增加当前选择的裁切比例状态
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('4:3');

  const handleChooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('需要相册权限才能选择背景图片！');
      return;
    }

    // 获取选定的裁切比例
    const aspectRatio = aspectRatioOptions.find(option => option.id === selectedAspectRatio)?.value || [4, 3];
    
    // 根据是否为原始比例调整选项
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    };
    
    // 只有当不是原始比例时才添加aspect属性
    if (aspectRatio[0] !== 0 && aspectRatio[1] !== 0) {
      pickerOptions.aspect = aspectRatio;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      onSettingsChange({ 
        backgroundImageUri: pickerResult.assets[0].uri,
        backgroundImageOpacity: 0.5 // 设置默认透明度为50%
      });
    }
  };

  const handleRemoveImage = () => {
    onSettingsChange({ backgroundImageUri: undefined });
  };

  // 点击模态框外部关闭
  const handleBackdropPress = () => {
    onClose();
  };

  return (    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* 背景遮罩，点击可关闭模态框 */}
      <View
        style={[styles.modalOverlay, { alignItems: 'center' }]}
        // 点击背景关闭窗口
        onTouchEnd={handleBackdropPress}
      >
        {/* 模态框内容容器 */}
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#222' : '#fff',
              maxHeight: screenHeight * 0.9,
              flexDirection: 'column',
              minHeight: 500,
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            },
          ]}
          // 阻止点击事件冒泡，防止点击内容区域时关闭窗口
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* 模态框标题栏 */}
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: isDark ? '#444' : '#eaeaea',
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color: isDark ? '#fff' : '#000',
                },
              ]}
            >
              页面设置
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={onClose}
            >
              <FontAwesome name="times" size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* 内容区域使用ScrollView确保可滑动 */}
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ padding: 15 }}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true} // 确保滚动可用
          >
            {/* 纯色主题设置 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                纯色主题
              </Text>
              <View style={styles.optionGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: theme.backgroundColor,
                        borderColor:
                          currentSettings.themeId === theme.id && !currentSettings.backgroundImageUri
                            ? Colors[colorScheme].tint
                            : 'transparent',
                      },
                    ]}
                    onPress={() => onSettingsChange({ themeId: theme.id, backgroundImageUri: undefined })}
                  >
                    <Text style={{ color: theme.textColor, textAlign: 'center' }}>
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 自定义背景图片设置 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                自定义背景图片
              </Text>
              
              {/* 裁切比例选项 */}
              <Text style={[styles.optionLabel, { color: isDark ? '#ddd' : '#555', marginBottom: 8 }]}>
                裁切比例
              </Text>
              <View style={styles.optionGrid}>
                {aspectRatioOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.aspectRatioOption,
                      {
                        backgroundColor: isDark ? '#333' : '#f0f0f0',
                        borderColor: selectedAspectRatio === option.id 
                          ? Colors[colorScheme].tint 
                          : isDark ? '#444' : '#ddd',
                        borderWidth: selectedAspectRatio === option.id ? 2 : 1,
                        padding: 8,
                        borderRadius: 8,
                        margin: 4,
                        minWidth: 80,
                      },
                    ]}
                    onPress={() => setSelectedAspectRatio(option.id)}
                  >
                    <Text style={{ 
                      color: isDark ? '#fff' : '#333',
                      textAlign: 'center',
                      fontSize: 13,
                    }}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {currentSettings.backgroundImageUri && (
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                  <Text style={{ color: isDark ? '#ccc' : '#555', marginBottom: 5 }}>
                    当前已设置背景图片
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.pageSettingsButton,
                  {
                    backgroundColor: isDark ? '#333' : Colors.light.tint,
                    borderColor: isDark ? '#555' : Colors.light.tint,
                    marginTop: 10,
                  },
                ]}
                onPress={handleChooseImage}
              >
                <Text style={{ color: '#fff' }}>
                  {currentSettings.backgroundImageUri ? '更换自定义图片' : '选择自定义图片'}
                </Text>
              </TouchableOpacity>
              
              {currentSettings.backgroundImageUri && (
                <TouchableOpacity
                  style={[
                    styles.pageSettingsButton,
                    {
                      backgroundColor: isDark ? '#444' : '#f44336',
                      borderColor: isDark ? '#555' : '#f44336',
                      marginTop: 10,
                    },
                  ]}
                  onPress={handleRemoveImage}
                >
                  <Text style={{ color: '#fff' }}>移除背景图片</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 背景图片透明度设置 */}
            {currentSettings.backgroundImageUri && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                  背景图片透明度 ({Math.round(currentSettings.backgroundImageOpacity * 100)}%)
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0.1}
                  maximumValue={1}
                  step={0.05}
                  value={currentSettings.backgroundImageOpacity}
                  onValueChange={(value: number) => onSettingsChange({ backgroundImageOpacity: value })}
                  minimumTrackTintColor={Colors[colorScheme].tint}
                  maximumTrackTintColor={isDark ? '#555' : '#ccc'}
                  thumbTintColor={Colors[colorScheme].tint}
                />
              </View>
            )}

            {/* 背景模糊度设置 */}
            {currentSettings.backgroundImageUri && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                  背景模糊度 ({currentSettings.backgroundImageBlur || 0}px)
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  value={currentSettings.backgroundImageBlur || 0}
                  onValueChange={(value: number) => onSettingsChange({ backgroundImageBlur: value })}
                  minimumTrackTintColor={Colors[colorScheme].tint}
                  maximumTrackTintColor={isDark ? '#555' : '#ccc'}
                  thumbTintColor={Colors[colorScheme].tint}
                />
              </View>
            )}            {/* 页边距设置 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                左右页边距 ({currentSettings.marginValue}px)
              </Text>              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={8}
                maximumValue={40}
                step={1}
                value={currentSettings.marginValue}
                onValueChange={(value: number) => onSettingsChange({ marginValue: Math.round(value) })}
                minimumTrackTintColor={Colors[colorScheme].tint}
                maximumTrackTintColor={isDark ? '#555' : '#ccc'}
                thumbTintColor={Colors[colorScheme].tint}
              />
            </View>
          </ScrollView>

          {/* 确定按钮 */}
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: isDark ? '#444' : Colors[colorScheme].tint,
                marginTop: 10,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: '#fff' }]}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
