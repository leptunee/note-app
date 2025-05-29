import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CustomToolbarProps {
  editor: any;
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({ editor }) => {
  const handleBold = () => {
    try {
      if (editor && typeof editor.toggleBold === 'function') {
        editor.toggleBold();
      }
    } catch (error) {
      console.warn('Bold toggle failed:', error);
    }
  };

  const handleItalic = () => {
    try {
      if (editor && typeof editor.toggleItalic === 'function') {
        editor.toggleItalic();
      }
    } catch (error) {
      console.warn('Italic toggle failed:', error);
    }
  };

  const handleUnderline = () => {
    try {
      if (editor && typeof editor.toggleUnderline === 'function') {
        editor.toggleUnderline();
      }
    } catch (error) {
      console.warn('Underline toggle failed:', error);
    }
  };

  const handleBulletList = () => {
    try {
      if (editor && typeof editor.toggleBulletList === 'function') {
        editor.toggleBulletList();
      }
    } catch (error) {
      console.warn('Bullet list toggle failed:', error);
    }
  };

  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.button} onPress={handleBold}>
        <Text style={styles.buttonText}>B</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleItalic}>
        <Text style={[styles.buttonText, { fontStyle: 'italic' }]}>I</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleUnderline}>
        <Text style={[styles.buttonText, { textDecorationLine: 'underline' }]}>U</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleBulletList}>
        <Text style={styles.buttonText}>•</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 44,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 4,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});
