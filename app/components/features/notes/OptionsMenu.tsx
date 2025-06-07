import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Text, Alert, useColorScheme, Dimensions } from 'react-native';
import { menuStyles } from '../../shared/styles/menus';
import { buttonStyles } from '../../shared/styles/buttons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

// 统一图标大小常量
const ICON_SIZE = 20;

interface OptionsMenuProps {
  isVisible: boolean;
  onHide: () => void;
  onExport: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  isPinned?: boolean;
}

export const OptionsMenu = memo<OptionsMenuProps>(({ 
  isVisible, 
  onHide,
  onExport, 
  onDelete,
  onTogglePin,
  isPinned
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

  // 缓存事件处理函数
  const handleExportPress = useCallback(() => {
    onHide();
    onExport();
  }, [onHide, onExport]);

  const handleTogglePinPress = useCallback(() => {
    onHide();
    onTogglePin?.();
  }, [onHide, onTogglePin]);

  const handleDeletePress = useCallback(() => {
    onHide();
    Alert.alert(
      String(t('deleteConfirmTitle')),
      String(t('deleteConfirmMessage')),
      [
        { text: String(t('cancel')), style: 'cancel' },
        { text: String(t('delete')), onPress: onDelete, style: 'destructive' }
      ]
    );
  }, [onHide, onDelete, t]);  // 缓存样式计算
  const menuStyle = useMemo(() => [
    menuStyles.optionsMenu, 
    { 
      backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
      borderWidth: 0, // 完全移除边框
    }
  ], [colorScheme]);

  const optionItemStyle = useMemo(() => [
    menuStyles.optionItem,
    {
      borderBottomWidth: 0, // 移除底部边框
    }
  ], []);

  const textColor = useMemo(() => ({ 
    color: colorScheme === 'dark' ? '#fff' : '#000' 
  }), [colorScheme]);  const iconColor = useMemo(() => 
    Colors[colorScheme].tint, 
    [colorScheme]
  );

  // 获取屏幕尺寸用于backdrop
  const screenDimensions = useMemo(() => Dimensions.get('window'), []);
  
  // 创建自定义backdrop样式
  const backdropStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: -screenDimensions.height,
    left: -screenDimensions.width, 
    width: screenDimensions.width * 3,
    height: screenDimensions.height * 3,
    backgroundColor: 'transparent',
    zIndex: 998,
  }), [screenDimensions]);  return (
    <>
      <View style={menuStyles.optionsMenuContainer}>
        {/* 按钮总是显示，不受isVisible状态影响 */}
        <TouchableOpacity 
          style={buttonStyles.headerIconButton} 
          onPress={onHide}
        >
          <FontAwesome name="ellipsis-v" size={ICON_SIZE} color={Colors[colorScheme].tint} />
        </TouchableOpacity>
        
        {/* 下拉菜单根据isVisible状态显示或隐藏 */}
        {isVisible && (
          <View style={menuStyle}>            <TouchableOpacity 
              style={optionItemStyle} 
              onPress={handleExportPress}
            >
              <FontAwesome name="download" size={ICON_SIZE} color={iconColor} style={menuStyles.optionIcon} />
              <Text style={[menuStyles.optionText, textColor]}>导出笔记</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={optionItemStyle} 
              onPress={handleTogglePinPress}
            >
              <FontAwesome 
                name="thumb-tack" 
                size={ICON_SIZE} 
                color={iconColor} 
                style={menuStyles.optionIcon} 
              />
              <Text style={[menuStyles.optionText, textColor]}>
                {isPinned ? '取消置顶' : '置顶笔记'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={optionItemStyle} 
              onPress={handleDeletePress}
            >
              <FontAwesome name="trash-o" size={ICON_SIZE} color="#ff3b30" style={menuStyles.optionIcon} />
              <Text style={[menuStyles.optionText, { color: '#ff3b30' }]}>删除笔记</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
        {/* 背景遮罩，点击可关闭菜单 - 放在外层以覆盖整个屏幕 */}
      {isVisible && (
        <TouchableOpacity 
          style={backdropStyle} 
          activeOpacity={1}
          onPress={onHide}
        />
      )}
    </>
  );
});
