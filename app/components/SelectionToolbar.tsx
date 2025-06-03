// 选择模式工具栏组件
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ToolbarButtonProps {
  onPress: () => void;
  iconName: string;
  text: string;
  iconColor: string;
  textColor: string;
  iconSize?: number;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onPress, 
  iconName, 
  text, 
  iconColor, 
  textColor, 
  iconSize = 20 
}) => (
  <TouchableOpacity style={styles.toolbarButton} onPress={onPress}>
    <FontAwesome name={iconName as any} size={iconSize} color={iconColor} />
    <Text style={[styles.toolbarButtonText, { color: textColor }]}>{text}</Text>
  </TouchableOpacity>
);

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
  onExportSelected: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  isVisible,
  toolbarAnimation,
  selectedCount,
  totalCount,
  colors,
  onExitSelection,
  onToggleSelectAll,
  onDeleteSelected,
  onPinSelected,
  onExportSelected
}) => {
  if (!isVisible) return null;

  const isAllSelected = selectedCount === totalCount;

  return (
    <Animated.View 
      style={[
        styles.toolbar,
        {
          transform: [{ translateY: toolbarAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          })}],
          backgroundColor: colors.toolbarBackground,
        }
      ]}
    >
      <ToolbarButton 
        onPress={onExitSelection}
        iconName="arrow-left"
        text="返回"
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={onToggleSelectAll}
        iconName={isAllSelected ? "check-square" : "square-o"}
        text="全选"
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={onDeleteSelected}
        iconName="trash"
        text="删除"
        iconColor="#ff3b30"
        textColor="#ff3b30"
      />
      
      <ToolbarButton 
        onPress={onPinSelected}
        iconName="thumb-tack"
        text="置顶"
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
      
      <ToolbarButton 
        onPress={onExportSelected}
        iconName="share"
        text="导出"
        iconColor={colors.tint}
        textColor={colors.toolbarText}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  toolbarButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
});
