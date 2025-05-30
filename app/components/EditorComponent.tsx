// 编辑器组件 - 富文本编辑器封装
import React from 'react';
import { View } from 'react-native';
import { RichText } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface EditorComponentProps {
  editor: any;
}

export const EditorComponent: React.FC<EditorComponentProps> = ({ editor }) => {
  return (
    <KeyboardAwareScrollView 
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
      extraScrollHeight={40}
      showsVerticalScrollIndicator={true}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 0 }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}
      keyboardOpeningTime={250}
      enableResetScrollToCoords={false}
    >
      <View style={{ 
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}>
        <RichText 
          editor={editor}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            margin: 0,
            flex: 1,
            minHeight: 200,
          }}
          containerStyle={{
            backgroundColor: 'transparent',
            padding: 0,
            flex: 1,
          }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};
