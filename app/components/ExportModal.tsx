import React, { useState, useRef } from 'react'; // Added useRef
import { Modal, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { styles } from './styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import Toast, { ToastRef } from './Toast'; // Updated import for Toast and ToastRef
import { ExportResult } from '@/components/useExport'; // Import ExportResult

interface ExportModalProps {
  isVisible: boolean;
  onClose: () => void;
  // Update prop types to reflect that they now return Promise<ExportResult>
  onExportAsTxt: () => Promise<ExportResult>;
  onExportAsWord: () => Promise<ExportResult>;
  onExportAsMarkdown: () => Promise<ExportResult>;
  onExportAsImage: () => Promise<ExportResult>;
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
  const toastRef = useRef<ToastRef>(null); // Added toastRef

  // Updated handleExport to be async and use the result from exportFn to show toast
  const handleExport = async (exportFn: () => Promise<ExportResult>) => {
    onClose(); // Close modal first
    try {
      const result = await exportFn(); // Call the actual export function passed
      if (result.message) { // Show toast if a message is present
        toastRef.current?.show(result.message, result.success ? 'success' : 'error');
      }
    } catch (error) {
      // This catch is a fallback for unexpected errors during the export call itself
      console.error("Export failed from Modal: ", error);
      toastRef.current?.show('导出操作失败，请重试。', 'error');
    }
  };

  return (
    <>
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
            
            <TouchableOpacity 
              style={styles.exportOption} 
              onPress={() => handleExport(onExportAsTxt)}
            >
              <FontAwesome name="file-text-o" size={24} color={Colors[colorScheme].tint} />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>文本文件 (.txt)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportOption} 
              onPress={() => handleExport(onExportAsWord)}
            >
              <FontAwesome name="file-word-o" size={24} color="#2B579A" />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Word文档 (.html)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportOption} 
              onPress={() => handleExport(onExportAsMarkdown)}
            >
              <FontAwesome name="file-code-o" size={24} color="#663399" />
              <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Markdown (.md)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.exportOption} 
              onPress={() => handleExport(onExportAsImage)}
            >
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
      
      {/* Pass ref to Toast component */}
      <Toast ref={toastRef} />
    </>
  );
};
