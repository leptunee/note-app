import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { OptionsMenu } from './OptionsMenu';

interface NoteHeaderProps {
  isNewNote: boolean;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  showOptionsMenu: boolean;
  toggleOptionsMenu: () => void;
}

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  isNewNote,
  onBack,
  onSave,
  onExport,
  onDelete,
  showOptionsMenu,
  toggleOptionsMenu
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>
          {String(t('back'))}
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        {isNewNote ? String(t('add')) : String(t('edit'))}
      </Text>
      
      <View style={styles.headerActions}>
        {!isNewNote && (
          <OptionsMenu 
            isVisible={showOptionsMenu} 
            onHide={toggleOptionsMenu}
            onExport={onExport}
            onDelete={onDelete}
          />
        )}
        
        <TouchableOpacity onPress={onSave} style={{marginLeft: 15}}>
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint }]}>
            {String(t('save'))}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
