// 笔记列表项组件
import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
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
    // 其他日期显示 YYYY/MM/DD
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
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
  // 使用 useMemo 缓存昂贵的计算
  const firstImageUri = useMemo(() => extractFirstImageUri(note.content), [note.content]);
  
  // 缓存格式化的日期
  const formattedDate = useMemo(() => formatDate(note.updatedAt || note.createdAt), [note.updatedAt, note.createdAt]);
  
  // 缓存截断的内容
  const truncatedContent = useMemo(() => {
    const maxLength = firstImageUri ? 40 : 60;
    return truncateContent(note.content, maxLength);
  }, [note.content, firstImageUri, truncateContent]);
  
  // 缓存样式计算
  const noteItemStyle = useMemo(() => [
    styles.noteItem, 
    { 
      backgroundColor: colors.cardBackground,
      borderLeftColor: colors.tint 
    }
  ], [colors.cardBackground, colors.tint]);
  
  const checkboxStyle = useMemo(() => [
    styles.checkbox, 
    isSelected && styles.checkboxSelected
  ], [isSelected]);
  
  // 使用 useCallback 缓存事件处理函数
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  
  const handleLongPress = useCallback(() => {
    onLongPress();
  }, [onLongPress]);
  
  const handleToggleSelection = useCallback(() => {
    onToggleSelection();
  }, [onToggleSelection]);  return (
    <TouchableOpacity 
      style={noteItemStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.noteContentContainer}>
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={checkboxStyle}
              onPress={handleToggleSelection}
            >
              {isSelected && (
                <FontAwesome name="check" size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}        <View style={[styles.noteTextContainer, isSelectionMode && styles.noteTextContainerWithCheckbox]}>
          <Text 
            style={[styles.noteTitle, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {note.title}
          </Text>
          <Text 
            style={[styles.noteContent, { color: colors.secondaryText }]} 
            numberOfLines={firstImageUri ? 1 : 2}
          >
            {truncatedContent}
          </Text>
            {/* 底部日期和置顶图标行 */}
          <View style={styles.bottomRow}>
            <Text style={[styles.noteDate, { color: colors.tertiaryText }]}>
              {formattedDate}
            </Text>
            {note.pinned && (
              <FontAwesome 
                name="thumb-tack" 
                size={12} 
                color={colors.tint} 
                style={styles.pinIconBottom}
              />
            )}
          </View>
        </View>
        
        {firstImageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: firstImageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
              // 添加性能优化属性
              loadingIndicatorSource={undefined}
              fadeDuration={200}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 深度优化渲染性能
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.updatedAt === nextProps.note.updatedAt &&
    prevProps.note.pinned === nextProps.note.pinned &&
    prevProps.isSelectionMode === nextProps.isSelectionMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.colors.cardBackground === nextProps.colors.cardBackground &&
    prevProps.colors.tint === nextProps.colors.tint &&
    prevProps.colors.text === nextProps.colors.text &&
    prevProps.colors.secondaryText === nextProps.colors.secondaryText &&
    prevProps.colors.tertiaryText === nextProps.colors.tertiaryText
  );
});

const styles = StyleSheet.create({
  noteItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  noteTextContainerWithCheckbox: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinIcon: {
    marginLeft: 8,
    opacity: 0.8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  pinIconBottom: {
    marginLeft: 6,
    opacity: 0.8,
  },imagePreviewContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
});
