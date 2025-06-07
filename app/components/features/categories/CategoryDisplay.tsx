// 分类显示组件 - 小型可点击的分类标签
import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/src/hooks/useNotes';
import { useTranslation } from 'react-i18next';

interface CategoryDisplayProps {
  category: Category;
  onPress: () => void;
  textColor?: string;
}

export const CategoryDisplay = memo<CategoryDisplayProps>(({
  category,
  onPress,
  textColor,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  const defaultTextColor = useMemo(() => 
    textColor || (colorScheme === 'dark' ? '#999' : '#888'),
    [textColor, colorScheme]
  );
  
  const iconStyle = useMemo(() => [
    styles.categoryIcon,
    { backgroundColor: category.color },
  ], [category.color]);
  
  const textStyle = useMemo(() => [
    styles.categoryName, 
    { color: defaultTextColor }
  ], [defaultTextColor]);
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>        <View
          style={iconStyle}
        >
          <FontAwesome
            name={category.icon as any}
            size={8}
            color="#ffffff"
          />
        </View>
        <Text style={textStyle}>
          {category.name}
        </Text>
        <FontAwesome 
          name="chevron-right" 
          size={8} 
          color={defaultTextColor} 
          style={styles.arrow}
        />
      </View>    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 12,
    height: 12,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  categoryName: {
    fontSize: 12,
    marginRight: 2,
  },
  arrow: {
    opacity: 0.6,
  },
});
