// 编辑器测试工具
import { useEffect } from 'react';

export function useEditorDebug(editor: any) {
  useEffect(() => {
    if (!editor) return;

    console.log('=== Editor Debug Info ===');
    console.log('Editor object:', editor);
    console.log('Available methods:', Object.getOwnPropertyNames(editor));
    console.log('Editor prototype:', Object.getPrototypeOf(editor));
    
    // 检查撤销/重做相关功能
    console.log('Undo/Redo capabilities:', {
      hasUndo: typeof editor.undo === 'function',
      hasRedo: typeof editor.redo === 'function',
      canUndo: editor.canUndo,
      canRedo: editor.canRedo,
      undoType: typeof editor.undo,
      redoType: typeof editor.redo,
      canUndoType: typeof editor.canUndo,
      canRedoType: typeof editor.canRedo
    });    // 检查 TenTap 特有的订阅方法
    console.log('TenTap 订阅方法检查:', {
      hasSubscribeToEditorStateUpdate: typeof editor._subscribeToEditorStateUpdate === 'function',
      hasSubscribeToSelectionUpdate: typeof editor._subscribeToSelectionUpdate === 'function',
      hasSubscribeToContentUpdate: typeof editor._subscribeToContentUpdate === 'function',
      subscribeMethodType: typeof editor._subscribeToEditorStateUpdate
    });

    // 检查编辑器是否有其他可能的状态订阅方法
    const editorMethods = Object.getOwnPropertyNames(editor);
    const subscribeMethods = editorMethods.filter(method => 
      method.includes('subscribe') || method.includes('on') || method.includes('listen')
    );
    console.log('可能的订阅相关方法:', subscribeMethods);

    // 检查编辑器扩展
    if (editor.extensionManager) {
      console.log('Extension manager:', editor.extensionManager);
      console.log('Extensions:', editor.extensionManager.extensions);
    }

    // 检查命令
    if (editor.commands) {
      console.log('Available commands:', Object.keys(editor.commands));
    }

    console.log('========================');
  }, [editor]);
}
