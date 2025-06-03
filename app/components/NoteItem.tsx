// 笔记列表项组件
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { extractFirstImageUri } from '../utils/imageUtils';

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

export const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelectionMode,
  isSelected,
  colors,
  onPress,
  onLongPress,
  onToggleSelection,
  truncateContent
}) => {
  const firstImageUri = extractFirstImageUri(note.content);

  // 格式化日期显示
  const formatDate = (timestamp: number) => {
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
  };return (
    <TouchableOpacity 
      style={[styles.noteItem, { 
        backgroundColor: colors.cardBackground,
        borderLeftColor: colors.tint 
      }]} 
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.noteContentContainer}>
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              onPress={onToggleSelection}
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
            {truncateContent(note.content, firstImageUri ? 40 : 60)}
          </Text>
            {/* 底部日期和置顶图标行 */}
          <View style={styles.bottomRow}>
            <Text style={[styles.noteDate, { color: colors.tertiaryText }]}>
              {formatDate(note.updatedAt || note.createdAt)}
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
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

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
