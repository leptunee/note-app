import React, { useRef, memo, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, useColorScheme, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../../styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import Toast, { ToastRef } from '../../ui/Toast/Toast';
import { ExportResult } from '@/src/hooks/useExport';

interface ExportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onExportAsTxt: () => Promise<ExportResult>;
  onExportAsWord: () => Promise<ExportResult>;
  onExportAsMarkdown: () => Promise<ExportResult>;
  onExportAsImage: () => Promise<ExportResult>;
}

export const ExportModal = memo<ExportModalProps>(({
  isVisible,
  onClose,
  onExportAsTxt,
  onExportAsWord,
  onExportAsMarkdown,
  onExportAsImage
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const toastRef = useRef<ToastRef>(null);

  const handleExport = useCallback(async (exportFn: () => Promise<ExportResult>) => {
    onClose(); // Close modal first
    try {
      const result = await exportFn();
      if (result.message) {
        toastRef.current?.show(result.message, result.success ? 'success' : 'error');
      }
    } catch (error) {
      toastRef.current?.show(t('exportOperationFailed'), 'error');
    }
  }, [onClose, t]);

  // Memoize export handlers
  const handleExportAsTxt = useCallback(() => handleExport(onExportAsTxt), [handleExport, onExportAsTxt]);
  const handleExportAsWord = useCallback(() => handleExport(onExportAsWord), [handleExport, onExportAsWord]);
  const handleExportAsMarkdown = useCallback(() => handleExport(onExportAsMarkdown), [handleExport, onExportAsMarkdown]);
  const handleExportAsImage = useCallback(() => handleExport(onExportAsImage), [handleExport, onExportAsImage]);

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    {t('selectExportFormat')}
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
                  onPress={handleExportAsTxt}
                >                  <FontAwesome name="file-text-o" size={24} color={Colors[colorScheme].tint} />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    {t('textFile')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleExportAsWord}
                >                  <FontAwesome name="file-word-o" size={24} color="#2B579A" />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    {t('wordDocument')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleExportAsMarkdown}
                >                  <FontAwesome name="file-code-o" size={24} color="#663399" />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    {t('markdownFile')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.exportOption} 
                  onPress={handleExportAsImage}
                >                  <FontAwesome name="file-image-o" size={24} color="#4CAF50" />
                  <Text style={[styles.exportOptionText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                    {t('imageFile')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: colorScheme === 'dark' ? '#444' : '#f0f0f0' }]} 
                  onPress={onClose}
                >                  <FontAwesome name="times-circle" size={16} color={colorScheme === 'dark' ? '#ccc' : '#666'} style={{marginRight: 6}} />
                  <Text style={[styles.closeButtonText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
        {/* Pass ref to Toast component */}
      <Toast ref={toastRef} />
    </>
  );
});
