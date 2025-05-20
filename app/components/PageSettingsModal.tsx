import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  useColorScheme,
  Platform, // 导入 Platform
  Dimensions // 导入 Dimensions
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

  const handleChooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('需要相册权限才能选择背景图片！');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      onSettingsChange({ backgroundImageUri: pickerResult.assets[0].uri });
    }
  };

  const handleRemoveImage = () => {
    onSettingsChange({ backgroundImageUri: undefined });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.modalOverlay, { alignItems: 'center' }]}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContainer, 
              { 
                backgroundColor: isDark ? '#222' : '#fff',
                maxHeight: screenHeight * 0.9, // 从0.8增加到0.9，占据更多屏幕空间
                flexDirection: 'column',
                minHeight: 500, // 从300增加到500，确保有足够的最小高度
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
              }
            ]}>
              <View style={[styles.modalHeader, { 
                borderBottomColor: isDark ? '#444' : '#eaeaea'
              }]}>
                <Text style={[styles.modalTitle, { 
                  color: isDark ? '#fff' : '#000'
                }]}>
                  页面设置
                </Text>
                <TouchableOpacity 
                  style={styles.modalCloseBtn}
                  onPress={onClose}
                >
                  <FontAwesome name="times" size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={{ flex: 1, width: '100%' }} 
                contentContainerStyle={{ paddingBottom: 15 }} 
                showsVerticalScrollIndicator={true}
              >
                {/* 主题设置 */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                    主题
                  </Text>
                  <View style={styles.optionGrid}>
                    {themes.map(theme => (
                      <TouchableOpacity
                        key={theme.id}
                        style={[
                          styles.themeOption,
                          {
                            backgroundColor: theme.backgroundColor,
                            borderColor: currentSettings.themeId === theme.id ? Colors[colorScheme].tint : 'transparent'
                          }
                        ]}
                        onPress={() => onSettingsChange({ themeId: theme.id })}
                      >
                        <Text style={{ color: theme.textColor, textAlign: 'center' }}>
                          {theme.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 背景图片设置 */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                    背景图片
                  </Text>
                  {currentSettings.backgroundImageUri ? (
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                      <Text style={{ color: isDark ? '#ccc' : '#555', marginBottom: 5 }}>当前背景: </Text>
                      <TouchableOpacity onPress={handleRemoveImage}>
                        <FontAwesome name="times-circle" size={24} color={Colors.light.tint} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.pageSettingsButton, { backgroundColor: isDark ? '#333' : Colors.light.tint, borderColor: isDark ? '#555' : Colors.light.tint } ]}
                    onPress={handleChooseImage}
                  >
                    <Text style={{ color: '#fff' }}>{currentSettings.backgroundImageUri ? '更换图片' : '选择图片'}</Text>
                  </TouchableOpacity>
                  
                  {currentSettings.backgroundImageUri && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={[styles.sectionTitle, { fontSize: 14, color: isDark ? '#ccc' : '#555', marginBottom: 5 }]}>
                        背景图片透明度
                      </Text>
                      {Platform.OS === 'web' ? (
                        <input
                          type="range"
                          aria-label="背景图片透明度"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={currentSettings.backgroundImageOpacity}
                          onChange={(e) => onSettingsChange({ backgroundImageOpacity: parseFloat(e.target.value) })}
                          style={{
                            width: '100%',
                            accentColor: Colors[colorScheme].tint
                          }}
                        />
                      ) : (
                        <Slider
                          style={{ width: '100%', height: 40 }}
                          minimumValue={0.1}
                          maximumValue={1}
                          step={0.05}
                          value={currentSettings.backgroundImageOpacity}
                          onValueChange={(value: number) => onSettingsChange({ backgroundImageOpacity: value })}
                          minimumTrackTintColor={Colors[colorScheme].tint}
                          maximumTrackTintColor={isDark ? "#555" : "#ccc"}
                          thumbTintColor={Colors[colorScheme].tint}
                        />
                      )}
                    </View>
                  )}
                </View>

                {/* 页边距设置 - 使用滑块 */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#333' }]}>
                    页边距 ({(currentSettings.marginValue / 100 * 36 + 4).toFixed(0)}px)
                  </Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="range"
                      aria-label="页边距"
                      min={0}
                      max={100}
                      step={1}
                      value={currentSettings.marginValue}
                      onChange={(e) => onSettingsChange({ marginValue: parseInt(e.target.value, 10) })}
                      style={{
                        width: '100%',
                        accentColor: Colors[colorScheme].tint
                      }}
                    />
                  ) : (
                    <Slider
                      style={{ width: '100%', height: 40 }}
                      minimumValue={0}
                      maximumValue={100}
                      step={1}
                      value={currentSettings.marginValue}
                      onValueChange={(value: number) => onSettingsChange({ marginValue: value })}
                      minimumTrackTintColor={Colors[colorScheme].tint}
                      maximumTrackTintColor={isDark ? "#555" : "#ccc"}
                      thumbTintColor={Colors[colorScheme].tint}
                    />
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.closeButton, 
                  { 
                    backgroundColor: isDark ? '#444' : Colors[colorScheme].tint,
                    marginTop: 10
                  }
                ]}
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: '#fff' }]}>
                  确定
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
