// 性能优化版本的笔记项组件
import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { extractFirstImageUri } from '@/src/utils/imageUtils';

interface NoteItemProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    pinned?: boolean;
  };
  isSelectionMode: boolean;
  isSelected: boolean;
  colors: {
    cardBackground: string;
    tint: string;
    text: string;
    secondaryText: string;
    tertiaryText: string;
  };
  onPress: () => void;
  onLongPress: () => void;
  onToggleSelection: () => void;
  truncateContent: (text: string, maxLength?: number) => string;
}

// 将格式化日期函数移到组件外部，避免每次渲染重新创建
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  
  // 检查是否为今天
  const isToday = date.toDateString() === today.toDateString();
  
  if (isToday) {
    // 今天显示时间 HH:MM
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    // 非今天显示日期 MM/DD
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  }
};

export const NoteItem = memo<NoteItemProps>(({
  note,
  isSelectionMode,
  isSelected,
  colors,
  onPress,
  onLongPress,
  onToggleSelection,
  truncateContent
}) => {
  const { t } = useTranslation();
  // 使用 useMemo 缓存计算结果
  const truncatedContent = useMemo(() => 
    truncateContent(note.content, 80), 
    [note.content, truncateContent]
  );

  const firstImageUri = useMemo(() => 
    extractFirstImageUri(note.content), 
    [note.content]
  );

  const formattedDate = useMemo(() => 
    formatDate(note.updatedAt), 
    [note.updatedAt]
  );  // 缓存样式对象 - 使用固定边框宽度避免布局跳动
  const cardStyle = useMemo(() => [
    styles.noteCard,
    {
      backgroundColor: colors.cardBackground,
      borderColor: isSelected ? colors.tint : 'transparent',
      borderWidth: 2, // 固定边框宽度，避免选中时尺寸变化
    }
  ], [colors.cardBackground, colors.tint, isSelected]);

  const titleStyle = useMemo(() => [
    styles.noteTitle,
    { color: colors.text }
  ], [colors.text]);

  const contentStyle = useMemo(() => [
    styles.noteContent,
    { color: colors.secondaryText }
  ], [colors.secondaryText]);
  const dateStyle = useMemo(() => [
    styles.noteDate,
    { color: colors.tertiaryText }
  ], [colors.tertiaryText]);

  // 缓存 noteHeader 样式，多选模式下添加右边距避让勾选框
  const noteHeaderStyle = useMemo(() => [
    styles.noteHeader,
    isSelectionMode && { marginRight: 32 } // 为勾选框预留空间
  ], [isSelectionMode]);

  // 使用 useCallback 缓存事件处理函数
  const handlePress = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelection();
    } else {
      onPress();
    }
  }, [isSelectionMode, onToggleSelection, onPress]);

  const handleLongPress = useCallback(() => {
    if (!isSelectionMode) {
      onLongPress();
    }
  }, [isSelectionMode, onLongPress]);

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* 选择模式指示器 */}
      {isSelectionMode && (
        <View style={styles.selectionIndicator}>
          <FontAwesome
            name={isSelected ? "check-circle" : "circle-o"}
            size={20}
            color={isSelected ? colors.tint : colors.secondaryText}
          />
        </View>
      )}      <View style={noteHeaderStyle}>
        <View style={styles.noteTitleRow}>          <Text style={titleStyle} numberOfLines={1}>
            {note.title || t('untitledNote')}
          </Text>{note.pinned && (
            <FontAwesome
              name="thumb-tack"
              size={12}
              color="#2196F3"
              style={styles.pinIcon}
            />
          )}
        </View>
        <Text style={dateStyle}>
          {formattedDate}
        </Text>
      </View>

      <View style={styles.noteBody}>
        {firstImageUri && (
          <Image
            source={{ uri: firstImageUri }}
            style={styles.noteImage}
            resizeMode="cover"
          />
        )}
        <View style={[styles.noteTextContainer, firstImageUri && styles.noteTextWithImage]}>          <Text style={contentStyle} numberOfLines={2}>
            {truncatedContent || t('noContent')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// 添加 displayName 以便于调试
NoteItem.displayName = 'NoteItem';

const styles = StyleSheet.create({  noteCard: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 1.5,
    elevation: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20, // 添加行高以改善对齐
  },pinIcon: {
    marginLeft: 6,
    marginTop: 2, // 增加微调对齐
    alignSelf: 'center', // 确保垂直居中对齐
    transform: [{ rotate: '45deg' }],
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  noteBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  noteTextContainer: {
    flex: 1,
  },
  noteTextWithImage: {
    marginTop: 0,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});