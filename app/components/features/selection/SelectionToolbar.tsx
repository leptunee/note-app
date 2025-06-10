// 选择模式工具栏组件
import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface ToolbarButtonProps {
  onPress: () => void;
  iconName: string;
  text: string;
  iconColor: string;
  textColor: string;
  iconSize?: number;
}

const ToolbarButton = memo<ToolbarButtonProps>(({ 
  onPress, 
  iconName, 
  text, 
  iconColor, 
  textColor, 
  iconSize = 24 
}) => {
  // 缓存样式计算
  const textStyle = useMemo(() => [
    styles.toolbarButtonText, 
    { color: textColor }
  ], [textColor]);

  // 缓存事件处理函数
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity style={styles.toolbarButton} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <FontAwesome name={iconName as any} size={iconSize} color={iconColor} />
      </View>
      <Text style={textStyle}>{text}</Text>
    </TouchableOpacity>
  );
});

interface SelectionToolbarProps {
  isVisible: boolean;
  toolbarAnimation: Animated.Value;
  selectedCount: number;
  totalCount: number;
  colors: {
    toolbarBackground: string;
    tint: string;
    toolbarText: string;
  };
  onExitSelection: () => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onPinSelected: () => void;
  onUnpinSelected: () => void;  onExportSelected: () => void;
  onMoveSelected: () => void;
  selectedNotes: Set<string>;
  notes: Array<{ id: string; pinned?: boolean }>;
}

export const SelectionToolbar = memo<SelectionToolbarProps>(({
  isVisible,
  toolbarAnimation,
  selectedCount,
  totalCount,
  colors,
  onExitSelection,
  onToggleSelectAll,
  onDeleteSelected,
  onPinSelected,
  onUnpinSelected,
  onExportSelected,
  onMoveSelected,  selectedNotes,
  notes
}) => {
  const { t } = useTranslation();
  
  // 缓存计算值
  const isAllSelected = useMemo(() => selectedCount === totalCount, [selectedCount, totalCount]);
  
  // 缓存选中笔记的置顶状态计算
  const pinnedStatus = useMemo(() => {
    const selectedNotesArray = Array.from(selectedNotes);
    const selectedNotesData = notes.filter(note => selectedNotesArray.includes(note.id));
    const pinnedSelectedCount = selectedNotesData.filter(note => note.pinned).length;
    const unpinnedSelectedCount = selectedNotesData.length - pinnedSelectedCount;
    const allSelectedArePinned = unpinnedSelectedCount === 0 && pinnedSelectedCount > 0;
    
    return { allSelectedArePinned, pinnedSelectedCount, unpinnedSelectedCount };
  }, [selectedNotes, notes]);

  // 缓存动画样式
  const toolbarStyle = useMemo(() => [
    styles.toolbar,
    {
      transform: [{ 
        translateY: toolbarAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        })
      }],
      backgroundColor: colors.toolbarBackground,
    }
  ], [toolbarAnimation, colors.toolbarBackground]);

  // 使用 useCallback 缓存事件处理函数
  const handleExitSelection = useCallback(() => {
    onExitSelection();
  }, [onExitSelection]);

  const handleToggleSelectAll = useCallback(() => {
    onToggleSelectAll();
  }, [onToggleSelectAll]);

  const handleDeleteSelected = useCallback(() => {
    onDeleteSelected();
  }, [onDeleteSelected]);

  const handlePinAction = useCallback(() => {
    if (pinnedStatus.allSelectedArePinned) {
      onUnpinSelected();
    } else {
      onPinSelected();
    }
  }, [pinnedStatus.allSelectedArePinned, onUnpinSelected, onPinSelected]);

  const handleMoveSelected = useCallback(() => {
    onMoveSelected();
  }, [onMoveSelected]);

  const handleExportSelected = useCallback(() => {
    onExportSelected();
  }, [onExportSelected]);

  if (!isVisible) return null;
  
  return (
    <Animated.View style={toolbarStyle}>
      <ToolbarButton 
        onPress={handleExitSelection}
        iconName="chevron-left"
        text={t('back')}
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={handleToggleSelectAll}
        iconName={isAllSelected ? "check-square" : "square-o"}
        text={t('selectAll')}
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={handleDeleteSelected}
        iconName="trash-o"
        text={t('delete')}
        iconColor="#ff3b30"
        textColor="#ff3b30"
      />
        
      <ToolbarButton 
        onPress={handlePinAction}
        iconName={pinnedStatus.allSelectedArePinned ? "times" : "thumb-tack"}
        text={pinnedStatus.allSelectedArePinned ? t('unpin') : t('pin')}
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={handleMoveSelected}
        iconName="folder-o"
        text={t('move')}
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={handleExportSelected}
        iconName="download"
        text={t('export')}
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  iconContainer: {
    marginBottom: 4,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
