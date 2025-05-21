import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { OptionsMenu } from './OptionsMenu';
import { FontAwesome } from '@expo/vector-icons';

// 统一图标大小常量
const ICON_SIZE = 20;

interface NoteHeaderProps {
  isNewNote: boolean;
  onBack: () => void;
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showOptionsMenu: boolean;
  toggleOptionsMenu: () => void;
  onPageSettings: () => void;
}

export const NoteHeader: React.FC<NoteHeaderProps> = ({
  isNewNote,
  onBack,
  onSave,
  onExport,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showOptionsMenu,
  toggleOptionsMenu,
  onPageSettings
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.header}>      
      <TouchableOpacity onPress={onBack} style={styles.headerButton}>
        <FontAwesome 
          name="chevron-left" 
          size={ICON_SIZE} 
          color={Colors[colorScheme].tint} 
        />
        <Text style={[styles.actionText, { color: Colors[colorScheme].tint, marginLeft: 5 }]}>
          {String(t('back'))}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={onPageSettings}
          style={styles.headerIconButton}
        >
          <FontAwesome 
            name="sliders" 
            size={ICON_SIZE} 
            color={Colors[colorScheme].tint} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onUndo}
          style={styles.headerIconButton}
          disabled={!canUndo}
          activeOpacity={canUndo ? 0.7 : 1}
        >
          <FontAwesome 
            name="undo" 
            size={ICON_SIZE} 
            color={canUndo ? Colors[colorScheme].tint : '#888'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onRedo}
          style={styles.headerIconButton}
          disabled={!canRedo}
          activeOpacity={canRedo ? 0.7 : 1}
        >
          <FontAwesome 
            name="repeat" 
            size={ICON_SIZE} 
            color={canRedo ? Colors[colorScheme].tint : '#888'} 
          />
        </TouchableOpacity>

        {!isNewNote && (
          <OptionsMenu 
            isVisible={showOptionsMenu} 
            onHide={toggleOptionsMenu}
            onExport={onExport}
            onDelete={onDelete}
          />
        )}
        
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
          <FontAwesome 
            name="check" 
            size={ICON_SIZE} 
            color={Colors[colorScheme].tint} 
          />
          <Text style={[styles.actionText, { color: Colors[colorScheme].tint, marginLeft: 5 }]}>
            {String(t('save'))}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
