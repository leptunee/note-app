import React from 'react';
import { View, ImageBackground } from 'react-native';
import { NoteHeader, NoteContent, ExportModal, PageSettingsModal, styles } from './components';
import { useNoteEdit } from './useNoteEdit';
import { themes, getBackgroundColor, getTextColor, getEditorBackgroundColor, getEditorBorderColor, getContentPadding } from './noteEditUtils';

export default function NoteEditScreen() {
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
  } = useNoteEdit(themes);

  return (
    <View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(pageSettings, colorScheme) }
    ]}>
      {pageSettings.backgroundImageUri && (
        <ImageBackground
          source={{ uri: pageSettings.backgroundImageUri }}
          style={styles.backgroundImage}
          imageStyle={{ opacity: pageSettings.backgroundImageOpacity }}
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
    </View>
  );
}
