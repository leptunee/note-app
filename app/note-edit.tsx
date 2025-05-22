import React, { useRef } from 'react';
import { View, ImageBackground, Platform } from 'react-native';
import { NoteHeader, NoteContent, ExportModal, PageSettingsModal, styles, Toast, type ToastRef } from './components';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
  const toastRef = useRef<ToastRef>(null); // Correctly typed toastRef
  const {
    title,
    content,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    titleError,
    showExportModal,
    setShowExportModal,
    showOptionsMenu,
    setShowOptionsMenu,
    showPageSettings,
    setShowPageSettings,
    pageSettings,
    isNewNote,
    noteViewRef,
    handleSave,
    handleDelete,
    handleExport,
    handleExportAsTxt,
    handleExportAsMarkdown,
    handleExportAsImage,
    handleExportAsWord,
    handleTitleChange,
    handleContentChange,
    handleOpenPageSettings,
    handlePageSettingsChange,
    MAX_TITLE_LENGTH,
    colorScheme,
  } = useNoteEdit(themes, toastRef); // Pass toastRef to useNoteEdit

  return (
    <View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(pageSettings, colorScheme) }
    ]}>      {pageSettings.backgroundImageUri && (
        <ImageBackground
          source={{ uri: pageSettings.backgroundImageUri }}
          style={[
            styles.backgroundImage,
            Platform.OS === 'web' && pageSettings.backgroundImageBlur ? 
              { filter: `blur(${pageSettings.backgroundImageBlur}px)` } : {}
          ]}
          imageStyle={{ 
            opacity: pageSettings.backgroundImageOpacity,
            ...(Platform.OS !== 'web' && pageSettings.backgroundImageBlur ? 
                { filter: `blur(${pageSettings.backgroundImageBlur}px)` } : {})
          }}
          resizeMode="cover"
        />
      )}
      <NoteHeader
        isNewNote={isNewNote}
        onBack={handleSave}
        onSave={handleSave}
        onExport={handleExport}
        onDelete={handleDelete}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        showOptionsMenu={showOptionsMenu}
        toggleOptionsMenu={() => setShowOptionsMenu(!showOptionsMenu)}
        onPageSettings={handleOpenPageSettings}
      />
      <View style={{ flex: 1, padding: getContentPadding(pageSettings.marginValue) }}>
        <NoteContent
          title={title}
          content={content}
          onChangeContent={handleContentChange}
          onChangeTitle={handleTitleChange}
          titleError={titleError}
          maxLength={MAX_TITLE_LENGTH}
          noteViewRef={noteViewRef}
          textColor={getTextColor(pageSettings, colorScheme)}
          editorBackgroundColor={getEditorBackgroundColor(pageSettings, colorScheme)}
          editorBorderColor={getEditorBorderColor(pageSettings, colorScheme)}
        />
      </View>
      <ExportModal
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportAsTxt={handleExportAsTxt}
        onExportAsWord={handleExportAsWord}
        onExportAsMarkdown={handleExportAsMarkdown}
        onExportAsImage={handleExportAsImage}
      />
      <PageSettingsModal
        isVisible={showPageSettings}
        onClose={() => setShowPageSettings(false)}
        currentSettings={pageSettings}
        onSettingsChange={handlePageSettingsChange}
      />
      <Toast ref={toastRef} /> {/* Add Toast component here for global access */}
    </View>
  );
}
