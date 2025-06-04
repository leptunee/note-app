// 批量导出选项对话框组件
import React, { useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, useColorScheme, TouchableWithoutFeedback } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Note } from '@/components/useNotes';
import { useExport } from '@/components/useExport';
import { styles } from './styles';
import Toast, { ToastRef } from './Toast';
import Colors from '@/constants/Colors';

interface BatchExportDialogProps {
  visible: boolean;
  onClose: () => void;
  notes: Note[];
  selectedCount: number;
}

export const BatchExportDialog: React.FC<BatchExportDialogProps> = ({
  visible,
  onClose,
  notes,
  selectedCount
}) => {  const colorScheme = useColorScheme() ?? 'light';
  const toastRef = useRef<ToastRef>(null);
  const { exportMultipleAsTxt, exportMultipleAsWord, exportMultipleAsMarkdown } = useExport();

  const handleExport = async (exportFunction: (notes: Note[]) => Promise<any>) => {
    onClose(); // 先关闭对话框
    
    try {
      const result = await exportFunction(notes);
      
      if (result.message) {
        toastRef.current?.show(result.message, result.success ? 'success' : 'error');
      }
    } catch (error) {
      console.error('批量导出过程中出错:', error);
      toastRef.current?.show('导出过程中发生错误，请重试。', 'error');
    }
  };

  return (
    <>      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    批量导出 ({selectedCount} 篇笔记)
                  </Text>
                  <TouchableOpacity 
                    style={styles.modalCloseBtn}
                    onPress={onClose}
                  >
                    <FontAwesome name="times" size={22} color={colorScheme === 'dark' ? '#ccc' : '#666'} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={() => handleExport(exportMultipleAsTxt)}
                >
                  <FontAwesome name="file-text-o" size={24} color={Colors[colorScheme].tint} />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>文本文件 (.txt)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={() => handleExport(exportMultipleAsWord)}
                >
                  <FontAwesome name="file-word-o" size={24} color="#2B579A" />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Word文档 (.html)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={() => handleExport(exportMultipleAsMarkdown)}
                >
                  <FontAwesome name="file-code-o" size={24} color="#663399" />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Markdown (.md)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }]} 
                  onPress={onClose}
                >
                  <FontAwesome name="times-circle" size={16} color={colorScheme === 'dark' ? '#ccc' : '#666'} style={{marginRight: 6}} />
                  <Text style={[styles.closeButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>取消</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      <Toast ref={toastRef} />
    </>
  );
};
