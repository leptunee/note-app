// 批量导出选项对话框组件
import React, { useRef, memo, useCallback, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, useColorScheme, TouchableWithoutFeedback } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Note } from '@/src/hooks/useNotes';
import { useExport } from '@/src/hooks/useExport';
import { styles } from '../../styles';
import Toast, { ToastRef } from '../../ui/Toast/Toast';
import Colors from '@/constants/Colors';

interface BatchExportDialogProps {
  visible: boolean;
  onClose: () => void;
  notes: Note[];
  selectedCount: number;
}

export const BatchExportDialog = memo<BatchExportDialogProps>(({
  visible,
  onClose,
  notes,
  selectedCount
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const toastRef = useRef<ToastRef>(null);
  const { exportMultipleAsTxt, exportMultipleAsWord, exportMultipleAsMarkdown } = useExport();

  // 缓存样式计算
  const modalContainerStyle = useMemo(() => [
    styles.modalContainer, 
    { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }
  ], [colorScheme]);

  const titleStyle = useMemo(() => [
    styles.modalTitle, 
    { color: colorScheme === 'dark' ? '#fff' : '#000' }
  ], [colorScheme]);

  const optionTextStyle = useMemo(() => [
    styles.exportOptionText, 
    { color: colorScheme === 'dark' ? '#fff' : '#000' }
  ], [colorScheme]);

  const closeButtonStyle = useMemo(() => [
    styles.closeButton, 
    { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }
  ], [colorScheme]);

  const closeButtonTextStyle = useMemo(() => [
    styles.closeButtonText, 
    { color: colorScheme === 'dark' ? '#fff' : '#333' }
  ], [colorScheme]);

  const closeIconColor = useMemo(() => 
    colorScheme === 'dark' ? '#ccc' : '#666', 
    [colorScheme]
  );

  const tintColor = useMemo(() => 
    Colors[colorScheme].tint, 
    [colorScheme]
  );

  const handleExport = useCallback(async (exportFunction: (notes: Note[]) => Promise<any>) => {
    onClose(); // 先关闭对话框
    
    try {
      const result = await exportFunction(notes);
      
      if (result.message) {
        toastRef.current?.show(result.message, result.success ? 'success' : 'error');
      }    } catch (error) {
      toastRef.current?.show('导出过程中发生错误，请重试。', 'error');
    }
  }, [notes, onClose]);

  const handleTxtExport = useCallback(() => {
    handleExport(exportMultipleAsTxt);
  }, [handleExport, exportMultipleAsTxt]);

  const handleWordExport = useCallback(() => {
    handleExport(exportMultipleAsWord);
  }, [handleExport, exportMultipleAsWord]);

  const handleMarkdownExport = useCallback(() => {
    handleExport(exportMultipleAsMarkdown);
  }, [handleExport, exportMultipleAsMarkdown]);

  return (
    <>      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>            <TouchableWithoutFeedback>
              <View style={modalContainerStyle}>                <View style={styles.modalHeader}>
                  <Text style={titleStyle}>
                    批量导出 ({String(selectedCount)} 篇笔记)
                  </Text>
                  <TouchableOpacity 
                    style={styles.modalCloseBtn}
                    onPress={onClose}
                  >
                    <FontAwesome name="times" size={22} color={closeIconColor} />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleTxtExport}
                >
                  <FontAwesome name="file-text-o" size={24} color={tintColor} />
                  <Text style={optionTextStyle}>文本文件 (.txt)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleWordExport}
                >
                  <FontAwesome name="file-word-o" size={24} color="#2B579A" />
                  <Text style={optionTextStyle}>Word文档 (.html)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleMarkdownExport}
                >
                  <FontAwesome name="file-code-o" size={24} color="#663399" />
                  <Text style={optionTextStyle}>Markdown (.md)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={closeButtonStyle} 
                  onPress={onClose}
                >
                  <FontAwesome name="times-circle" size={16} color={closeIconColor} style={{marginRight: 6}} />
                  <Text style={closeButtonTextStyle}>取消</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
        <Toast ref={toastRef} />
    </>
  );
});
