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
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  colors,
  onAboutPress,
  onAddPress
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.aboutButton}
        onPress={onAboutPress}
      >
        <FontAwesome 
          name="info-circle" 
          size={24} 
          color={colors.text} 
        />
      </TouchableOpacity>
      
      <Text style={[styles.header, { color: colors.text }]}>{title}</Text>
      
      <TouchableOpacity
        style={[styles.addIconButton, { backgroundColor: colors.tint }]}
        onPress={onAddPress}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>
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
  aboutButton: {
    padding: 8,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
