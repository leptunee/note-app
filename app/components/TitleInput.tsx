import React from 'react';
import { TextInput, Text, View, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

interface TitleInputProps {
  title: string;
  titleError: string;
  maxLength: number;
  onChangeTitle: (text: string) => void;
}

export const TitleInput: React.FC<TitleInputProps> = ({
  title,
  titleError,
  maxLength,
  onChangeTitle
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  
  const handleChangeText = (text: string) => {
    onChangeTitle(text);
  };
  
  return (
    <View>
      <TextInput
        style={[styles.input, { 
          backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
          color: colorScheme === 'dark' ? '#fff' : '#000',
          borderColor: titleError ? '#ff3b30' : colorScheme === 'dark' ? '#444' : '#ddd'
        }]}
        placeholder={String(t('title'))}
        value={title}
        onChangeText={handleChangeText}
        maxLength={maxLength + 10} // 稍微给一点余量，以便显示错误
        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
      />
      
      {titleError ? (
        <Text style={styles.errorText}>{titleError}</Text>
      ) : null}
    </View>
  );
};
