// 笔记列表头部组件
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface NotesHeaderProps {
  title: string;
  colors: {
    background: string;
    text: string;
    tint: string;
  };
  onAboutPress: () => void;
  onAddPress: () => void;
  onSearchPress: () => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  colors,
  onAboutPress,
  onAddPress,
  onSearchPress
}) => {  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.header, { color: colors.text }]}>{title}</Text>
      
      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAboutPress}
        >
          <FontAwesome 
            name="info-circle" 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSearchPress}
        >
          <FontAwesome 
            name="search" 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAddPress}
        >
          <FontAwesome name="plus" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
