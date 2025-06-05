import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
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
  { id: 'dark', name: '淡绿', backgroundColor: '#e8f5e9', textColor: '#1b5e20', editorBackgroundColor: '#c8e6c9', editorBorderColor: '#81c784' },
  { id: 'sepia', name: '护眼', backgroundColor: '#f8f1e3', textColor: '#5b4636', editorBackgroundColor: '#f0e8da', editorBorderColor: '#d8c8b6' },
  { id: 'blue', name: '蓝色', backgroundColor: '#edf6ff', textColor: '#333333', editorBackgroundColor: '#e0f0ff', editorBorderColor: '#c0d8f0' },
];

export const PageSettingsModal: React.FC<PageSettingsModalProps> = memo(({
  isVisible,
  onClose,
  currentSettings,
  onSettingsChange
}) => {  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  // 始终使用亮色主题样式，不受系统暗黑模式影响
  const isDark = useMemo(() => false, []);
  const screenHeight = useMemo(() => Dimensions.get('window').height, []);
  
  // 定义裁切比例选项
  const aspectRatioOptions: AspectRatioOption[] = useMemo(() => [
    { id: 'original', name: '原始比例', value: [0, 0] },
    { id: '1:1', name: '1:1 (正方形)', value: [1, 1] },
    { id: '4:3', name: '4:3 (经典)', value: [4, 3] },
    { id: '16:9', name: '16:9 (宽屏)', value: [16, 9] },
    { id: '3:4', name: '3:4 (竖屏)', value: [3, 4] },
    { id: '9:16', name: '9:16 (全屏)', value: [9, 16] },
  ], []);
  
  // 增加当前选择的裁切比例状态
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('4:3');

  const handleChooseImage = useCallback(async () => {
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

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {      onSettingsChange({ 
        backgroundImageUri: pickerResult.assets[0].uri,
        backgroundImageOpacity: 0.5 // 设置默认透明度为50%
      });
    }
  }, [aspectRatioOptions, onSettingsChange, selectedAspectRatio]);

  const handleRemoveImage = useCallback(() => {
    onSettingsChange({ backgroundImageUri: undefined });
  }, [onSettingsChange]);

  // 点击模态框外部关闭
  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  // 主题选择处理器
  const handleThemeSelect = useCallback((themeId: string) => {
    onSettingsChange({ themeId, backgroundImageUri: undefined });
  }, [onSettingsChange]);

  // 滑块值改变处理器
  const handleOpacityChange = useCallback((value: number) => {
    onSettingsChange({ backgroundImageOpacity: value });
  }, [onSettingsChange]);

  const handleBlurChange = useCallback((value: number) => {
    onSettingsChange({ backgroundImageBlur: value });
  }, [onSettingsChange]);

  const handleMarginChange = useCallback((value: number) => {
    onSettingsChange({ marginValue: Math.round(value) });
  }, [onSettingsChange]);
  // 裁切比例选择处理器
  const handleAspectRatioSelect = useCallback((optionId: string) => {
    setSelectedAspectRatio(optionId);
  }, []);

  // 计算透明度百分比
  const opacityPercentage = useMemo(() => 
    Math.round(currentSettings.backgroundImageOpacity * 100), 
    [currentSettings.backgroundImageOpacity]
  );

  // 计算模糊度值
  const blurValue = useMemo(() => 
    currentSettings.backgroundImageBlur || 0, 
    [currentSettings.backgroundImageBlur]
  );

  // 计算当前选中的主题
  const selectedTheme = useMemo(() => 
    currentSettings.themeId, 
    [currentSettings.themeId]
  );

  // 计算是否有背景图片
  const hasBackgroundImage = useMemo(() => 
    Boolean(currentSettings.backgroundImageUri), 
    [currentSettings.backgroundImageUri]
  );

  // 计算滑块样式对象
  const sliderStyle = useMemo(() => ({ 
    width: '100%' as const, 
    height: 40 
  }), []);

  const sliderTrackColors = useMemo(() => ({
    minimum: Colors[colorScheme].tint,
    maximum: isDark ? '#555' : '#ccc',
    thumb: Colors[colorScheme].tint,
  }), [colorScheme, isDark]);

  // 计算样式对象
  const modalOverlayStyle = useMemo(() => [
    styles.modalOverlay, 
    { alignItems: 'center' as const }
  ], []);
  const modalContainerStyle = useMemo(() => [
    styles.modalContainer,
    {
      backgroundColor: isDark ? '#222' : '#fff',
      maxHeight: screenHeight * 0.9,
      flexDirection: 'column' as const,
      minHeight: 500,
      width: '100%' as const,
      justifyContent: 'flex-start' as const,
      alignItems: 'stretch' as const,
    },
  ], [isDark, screenHeight]);

  const modalHeaderStyle = useMemo(() => [
    styles.modalHeader,
    {
      borderBottomColor: isDark ? '#444' : '#eaeaea',
    },
  ], [isDark]);

  const modalTitleStyle = useMemo(() => [
    styles.modalTitle,
    {
      color: isDark ? '#fff' : '#000',
    },
  ], [isDark]);

  const sectionTitleStyle = useMemo(() => [
    styles.sectionTitle, 
    { color: isDark ? '#fff' : '#333' }
  ], [isDark]);

  const optionLabelStyle = useMemo(() => [
    styles.optionLabel, 
    { color: isDark ? '#ddd' : '#555', marginBottom: 8 }
  ], [isDark]);

  const closeButtonStyle = useMemo(() => [
    styles.closeButton,
    {
      backgroundColor: isDark ? '#444' : Colors[colorScheme].tint,
      marginTop: 10,
    },
  ], [isDark, colorScheme]);

  const pageSettingsButtonStyle = useMemo(() => [
    styles.pageSettingsButton,
    {
      backgroundColor: isDark ? '#333' : Colors.light.tint,
      borderColor: isDark ? '#555' : Colors.light.tint,
      marginTop: 10,
    },
  ], [isDark]);
  const removeButtonStyle = useMemo(() => [
    styles.pageSettingsButton,
    {
      backgroundColor: isDark ? '#444' : '#f44336',
      borderColor: isDark ? '#555' : '#f44336',
      marginTop: 10,
    },
  ], [isDark]);

  // 主题选项样式生成器
  const getThemeOptionStyle = useCallback((theme: PageTheme) => [
    styles.themeOption,
    {
      backgroundColor: theme.backgroundColor,
      borderColor:
        selectedTheme === theme.id && !hasBackgroundImage
          ? Colors[colorScheme].tint
          : 'transparent',
    },
  ], [selectedTheme, hasBackgroundImage, colorScheme]);

  // 裁切比例选项样式生成器
  const getAspectRatioOptionStyle = useCallback((optionId: string) => [
    styles.aspectRatioOption,
    {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      borderColor: selectedAspectRatio === optionId 
        ? Colors[colorScheme].tint 
        : isDark ? '#444' : '#ddd',
      borderWidth: selectedAspectRatio === optionId ? 2 : 1,
      padding: 8,
      borderRadius: 8,
      margin: 4,
      minWidth: 80,
    },
  ], [selectedAspectRatio, isDark, colorScheme]);

  // 动态文本样式
  const themeTextStyle = useCallback((theme: PageTheme) => ({
    color: theme.textColor,
    textAlign: 'center' as const,
  }), []);

  const aspectRatioTextStyle = useMemo(() => ({
    color: isDark ? '#fff' : '#333',
    textAlign: 'center' as const,
    fontSize: 13,
  }), [isDark]);
  const backgroundStatusTextStyle = useMemo(() => ({
    color: isDark ? '#ccc' : '#555',
    marginBottom: 5,
  }), [isDark]);

  // 容器样式
  const sectionContainerStyle = useMemo(() => ({
    marginBottom: 20
  }), []);

  const centerContainerStyle = useMemo(() => ({
    alignItems: 'center' as const,
    marginVertical: 10
  }), []);

  // 文本样式
  const buttonTextStyle = useMemo(() => ({
    color: '#fff'
  }), []);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* 背景遮罩，点击可关闭模态框 */}      <View
        style={modalOverlayStyle}
        // 点击背景关闭窗口
        onTouchEnd={handleBackdropPress}
      >
        {/* 模态框内容容器 */}
        <View
          style={modalContainerStyle}
          // 阻止点击事件冒泡，防止点击内容区域时关闭窗口
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* 模态框标题栏 */}
          <View style={modalHeaderStyle}>
            <Text style={modalTitleStyle}>
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
          >            {/* 纯色主题设置 */}
            <View style={sectionContainerStyle}>
              <Text style={sectionTitleStyle}>
                纯色主题
              </Text>
              <View style={styles.optionGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={getThemeOptionStyle(theme)}
                    onPress={() => handleThemeSelect(theme.id)}
                  >
                    <Text style={themeTextStyle(theme)}>
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>            {/* 自定义背景图片设置 */}
            <View style={sectionContainerStyle}>
              <Text style={sectionTitleStyle}>
                自定义背景图片
              </Text>
              {/* 裁切比例选项 */}
              <Text style={optionLabelStyle}>
                裁切比例
              </Text>
              <View style={styles.optionGrid}>
                {aspectRatioOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={getAspectRatioOptionStyle(option.id)}
                    onPress={() => handleAspectRatioSelect(option.id)}
                  >
                    <Text style={aspectRatioTextStyle}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {hasBackgroundImage && (
                <View style={centerContainerStyle}>
                  <Text style={backgroundStatusTextStyle}>
                    当前已设置背景图片
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={pageSettingsButtonStyle}
                onPress={handleChooseImage}
              >
                <Text style={buttonTextStyle}>
                  {hasBackgroundImage ? '更换自定义图片' : '选择自定义图片'}
                </Text>
              </TouchableOpacity>
              
              {hasBackgroundImage && (
                <TouchableOpacity
                  style={removeButtonStyle}
                  onPress={handleRemoveImage}
                >
                  <Text style={buttonTextStyle}>移除背景图片</Text>
                </TouchableOpacity>
              )}
            </View>            {/* 背景图片透明度设置 */}
            {hasBackgroundImage && (
              <View style={sectionContainerStyle}>
                <Text style={sectionTitleStyle}>
                  背景图片透明度 ({opacityPercentage}%)
                </Text>
                <Slider
                  style={sliderStyle}
                  minimumValue={0.1}
                  maximumValue={1}
                  step={0.05}
                  value={currentSettings.backgroundImageOpacity}
                  onValueChange={handleOpacityChange}
                  minimumTrackTintColor={sliderTrackColors.minimum}
                  maximumTrackTintColor={sliderTrackColors.maximum}
                  thumbTintColor={sliderTrackColors.thumb}
                />
              </View>
            )}            {/* 背景模糊度设置 */}
            {hasBackgroundImage && (
              <View style={sectionContainerStyle}>
                <Text style={sectionTitleStyle}>
                  背景模糊度 ({blurValue}px)
                </Text>
                <Slider
                  style={sliderStyle}
                  minimumValue={0}
                  maximumValue={10}
                  step={1}
                  value={blurValue}
                  onValueChange={handleBlurChange}
                  minimumTrackTintColor={sliderTrackColors.minimum}
                  maximumTrackTintColor={sliderTrackColors.maximum}
                  thumbTintColor={sliderTrackColors.thumb}
                />
              </View>
            )}            {/* 页边距设置 */}
            <View style={sectionContainerStyle}>
              <Text style={sectionTitleStyle}>
                左右页边距 ({currentSettings.marginValue}px)
              </Text>
              <Slider
                style={sliderStyle}
                minimumValue={8}
                maximumValue={40}
                step={1}
                value={currentSettings.marginValue}
                onValueChange={handleMarginChange}
                minimumTrackTintColor={sliderTrackColors.minimum}
                maximumTrackTintColor={sliderTrackColors.maximum}                thumbTintColor={sliderTrackColors.thumb}
              />
            </View>
          </ScrollView>
          
          {/* 确定按钮 */}
          <TouchableOpacity
            style={closeButtonStyle}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: '#fff' }]}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>    </Modal>
  );
});
