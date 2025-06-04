// 分类显示组件 - 小型可点击的分类标签
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Category } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';

interface CategoryDisplayProps {
  category: Category;
  onPress: () => void;
  textColor?: string;
}

export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  category,
  onPress,
  textColor,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  const defaultTextColor = textColor || (colorScheme === 'dark' ? '#999' : '#888');
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: category.color },
          ]}
        >
          <FontAwesome
            name={category.icon as any}
            size={8}
            color="#ffffff"
          />
        </View>
        <Text style={[styles.categoryName, { color: defaultTextColor }]}>
          {category.name}
        </Text>
        <FontAwesome 
          name="chevron-right" 
          size={8} 
          color={defaultTextColor} 
          style={styles.arrow}
        />
      </View>
    </TouchableOpacity>
  );
};

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
