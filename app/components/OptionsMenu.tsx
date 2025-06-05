import React, { memo, useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Text, Alert, useColorScheme } from 'react-native';
import { styles } from './styles';
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
  }, [onHide, onDelete, t]);

  // 缓存样式计算
  const menuStyle = useMemo(() => [
    styles.optionsMenu, 
    { 
      backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
      borderColor: colorScheme === 'dark' ? '#444' : '#eaeaea'
    }
  ], [colorScheme]);

  const textColor = useMemo(() => ({ 
    color: colorScheme === 'dark' ? '#fff' : '#000' 
  }), [colorScheme]);

  const iconColor = useMemo(() => 
    colorScheme === 'dark' ? '#fff' : '#000', 
    [colorScheme]
  );

  return (
    <View style={styles.optionsMenuContainer}>
      {/* 按钮总是显示，不受isVisible状态影响 */}
      <TouchableOpacity 
        style={styles.headerIconButton} 
        onPress={onHide}
      >
        <FontAwesome name="ellipsis-v" size={ICON_SIZE} color={Colors[colorScheme].tint} />
      </TouchableOpacity>
        {/* 下拉菜单根据isVisible状态显示或隐藏 */}
      {isVisible && (
        <View style={menuStyle}>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleExportPress}
          >
            <FontAwesome name="download" size={ICON_SIZE} color={iconColor} style={styles.optionIcon} />
            <Text style={[styles.optionText, textColor]}>导出笔记</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleTogglePinPress}
          >
            <FontAwesome 
              name="thumb-tack" 
              size={ICON_SIZE} 
              color={iconColor} 
              style={styles.optionIcon} 
            />
            <Text style={[styles.optionText, textColor]}>
              {isPinned ? '取消置顶' : '置顶笔记'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleDeletePress}
          >
            <FontAwesome name="trash-o" size={ICON_SIZE} color="#ff3b30" style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: '#ff3b30' }]}>删除笔记</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});
