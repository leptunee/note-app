import React from 'react';
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
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ 
  isVisible, 
  onHide,
  onExport, 
  onDelete 
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

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
        <View style={[styles.optionsMenu, { 
          backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
          borderColor: colorScheme === 'dark' ? '#444' : '#eaeaea'
        }]}>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => {
              onHide();
              onExport();
            }}
          >
            <FontAwesome name="download" size={ICON_SIZE} color={colorScheme === 'dark' ? '#fff' : '#000'} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>导出笔记</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => {
              onHide();
              Alert.alert(
                String(t('deleteConfirmTitle')),
                String(t('deleteConfirmMessage')),
                [
                  { text: String(t('cancel')), style: 'cancel' },
                  { text: String(t('delete')), onPress: onDelete, style: 'destructive' }
                ]
              );
            }}
          >
            <FontAwesome name="trash-o" size={ICON_SIZE} color="#ff3b30" style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: '#ff3b30' }]}>删除笔记</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
