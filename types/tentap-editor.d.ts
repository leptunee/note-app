declare module '@10play/tentap-editor' {
  export function useEditorBridge(config: any): any;
  export function useBridgeState(editor: any): {
    canUndo?: boolean;
    canRedo?: boolean;
    isBoldActive?: boolean;
    isItalicActive?: boolean;
    isUnderlineActive?: boolean;
    isBulletListActive?: boolean;
    isOrderedListActive?: boolean;
    [key: string]: any;
  };
  export const TenTapStarterKit: any;
  export const RichText: any;
  export const Toolbar: any;
}
