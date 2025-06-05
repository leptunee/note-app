import React, { memo, useCallback, useMemo } from 'react';
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
  onTogglePin?: () => void;
  isPinned?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showOptionsMenu: boolean;
  toggleOptionsMenu: () => void;
  onPageSettings: () => void;
}

export const NoteHeader = memo<NoteHeaderProps>(({
  isNewNote,
  onBack,
  onSave,
  onExport,
  onDelete,
  onTogglePin,
  isPinned = false,
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

  // 缓存事件处理函数
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  const handleUndo = useCallback(() => {
    onUndo?.();
  }, [onUndo]);

  const handleRedo = useCallback(() => {
    onRedo?.();
  }, [onRedo]);

  const handlePageSettings = useCallback(() => {
    onPageSettings();
  }, [onPageSettings]);

  const handleToggleOptionsMenu = useCallback(() => {
    toggleOptionsMenu();
  }, [toggleOptionsMenu]);

  // 缓存样式计算
  const backButtonTextStyle = useMemo(() => [
    styles.actionText, 
    { color: Colors[colorScheme].tint, marginLeft: 5 }
  ], [colorScheme]);

  const saveButtonTextStyle = useMemo(() => [
    styles.actionText, 
    { color: Colors[colorScheme].tint, marginLeft: 5 }
  ], [colorScheme]);

  const undoIconColor = useMemo(() => 
    canUndo ? Colors[colorScheme].tint : '#888', 
    [canUndo, colorScheme]
  );

  const redoIconColor = useMemo(() => 
    canRedo ? Colors[colorScheme].tint : '#888', 
    [canRedo, colorScheme]
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
        <FontAwesome 
          name="chevron-left" 
          size={ICON_SIZE} 
          color={Colors[colorScheme].tint} 
        />
        <Text style={backButtonTextStyle}>
          {String(t('back'))}
        </Text>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        <TouchableOpacity 
          onPress={handlePageSettings}
          style={styles.headerIconButton}
        >
          <FontAwesome 
            name="sliders" 
            size={ICON_SIZE} 
            color={Colors[colorScheme].tint} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleUndo}
          style={styles.headerIconButton}
          disabled={!canUndo}
          activeOpacity={canUndo ? 0.7 : 1}
        >
          <FontAwesome 
            name="undo" 
            size={ICON_SIZE} 
            color={undoIconColor} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleRedo}
          style={styles.headerIconButton}
          disabled={!canRedo}
          activeOpacity={canRedo ? 0.7 : 1}
        >
          <FontAwesome 
            name="repeat" 
            size={ICON_SIZE} 
            color={redoIconColor} 
          />
        </TouchableOpacity>

        {!isNewNote && (
          <OptionsMenu 
            isVisible={showOptionsMenu} 
            onHide={handleToggleOptionsMenu}
            onExport={onExport}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            isPinned={isPinned}
          />
        )}

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <FontAwesome 
            name="check" 
            size={ICON_SIZE} 
            color={Colors[colorScheme].tint} 
          />
          <Text style={saveButtonTextStyle}>
            {String(t('save'))}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
