// 分类选择组件
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
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const colors = {
    background: isDark ? '#2a2a2a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#cccccc' : '#666666',
    border: isDark ? '#404040' : '#e0e0e0',
    activeBackground: isDark ? '#333333' : '#e3f2fd',
    activeText: Colors[colorScheme].tint,
  };

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId) || categories[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t('category', '分类')}
      </Text>
      
      <View style={[styles.selectorContainer, { borderColor: colors.border }]}>
        <View style={styles.selectedCategory}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: selectedCategory.color },
            ]}
          >
            <FontAwesome
              name={selectedCategory.icon as any}
              size={14}
              color="#ffffff"
            />
          </View>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {selectedCategory.name}
          </Text>
        </View>

        <View style={styles.categoryOptions}>
          {categories.map((category) => {
            const isSelected = category.id === selectedCategoryId;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: isSelected ? colors.activeBackground : 'transparent',
                  },
                ]}
                onPress={() => onCategoryChange(category.id)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor: isSelected ? category.color : colors.background,
                      borderColor: category.color,
                      borderWidth: isSelected ? 0 : 1,
                    },
                  ]}
                >
                  <FontAwesome
                    name={category.icon as any}
                    size={12}
                    color={isSelected ? '#ffffff' : category.color}
                  />
                </View>
                <Text
                  style={[
                    styles.optionName,
                    {
                      color: isSelected ? colors.activeText : colors.text,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}
                >
                  {category.name}
                </Text>
                {isSelected && (
                  <FontAwesome
                    name="check"
                    size={12}
                    color={colors.activeText}
                  />
                )}
              </TouchableOpacity>
            );
          })}        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorContainer: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  categoryOptions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  optionName: {
    fontSize: 14,
    flex: 1,
  },
});
