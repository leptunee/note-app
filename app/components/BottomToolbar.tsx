// filepath: d:\mycode\note-app-react\noteApp\app\components\BottomToolbar.tsx
import React from 'react';
import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from './styles';
import Colors from '@/constants/Colors';

// 统一图标大小常量
const ICON_SIZE = 20;

interface BottomToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onImage: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onNumberedList,
  onImage,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;

  return (
    <View style={styles.bottomToolbar}>
      <View style={styles.toolbarGroup}>
        <TouchableOpacity onPress={onBold} style={styles.toolbarButton}>
          <FontAwesome name="bold" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onItalic} style={styles.toolbarButton}>
          <FontAwesome name="italic" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onUnderline} style={styles.toolbarButton}>
          <FontAwesome name="underline" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity onPress={onBulletList} style={styles.toolbarButton}>
          <FontAwesome name="list-ul" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNumberedList} style={styles.toolbarButton}>
          <FontAwesome name="list-ol" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity onPress={onAlignLeft} style={styles.toolbarButton}>
          <FontAwesome name="align-left" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAlignCenter} style={styles.toolbarButton}>
          <FontAwesome name="align-center" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAlignRight} style={styles.toolbarButton}>
          <FontAwesome name="align-right" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbarGroup}>
        <TouchableOpacity onPress={onImage} style={styles.toolbarButton}>
          <FontAwesome name="image" size={ICON_SIZE} color={tintColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomToolbar;