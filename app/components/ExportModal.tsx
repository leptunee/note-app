import React from 'react';
import { Modal, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { styles } from './styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';

interface ExportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onExportAsTxt: () => void;
  onExportAsWord: () => void;
  onExportAsMarkdown: () => void;
  onExportAsImage: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isVisible,
  onClose,
  onExportAsTxt,
  onExportAsWord,
  onExportAsMarkdown,
  onExportAsImage
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>选择导出格式</Text>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={onClose}
            >
              <FontAwesome name="times" size={22} color={colorScheme === 'dark' ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.exportOption} onPress={onExportAsTxt}>
            <FontAwesome name="file-text-o" size={24} color={Colors[colorScheme].tint} />
            <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>文本文件 (.txt)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportOption} onPress={onExportAsWord}>
            <FontAwesome name="file-word-o" size={24} color="#2B579A" />
            <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Word文档 (.html)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportOption} onPress={onExportAsMarkdown}>
            <FontAwesome name="file-code-o" size={24} color="#663399" />
            <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Markdown (.md)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exportOption} onPress={onExportAsImage}>
            <FontAwesome name="file-image-o" size={24} color="#4CAF50" />
            <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>图片 (.png)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }]} 
            onPress={onClose}
          >
            <FontAwesome name="times-circle" size={16} color={colorScheme === 'dark' ? '#ccc' : '#666'} style={{marginRight: 6}} />
            <Text style={[styles.closeButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
