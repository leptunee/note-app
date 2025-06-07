// Re-export all style modules for easy access
export { layoutStyles } from './layout';
export { buttonStyles } from './buttons';
export { inputStyles } from './inputs';
export { modalStyles } from './modals';
export { textStyles } from './text';
export { exportStyles } from './export';
export { settingsStyles } from './settings';
export { menuStyles } from './menus';

// Legacy export for backward compatibility
import { layoutStyles } from './layout';
import { textStyles } from './text';
import { inputStyles } from './inputs';

export const baseStyles = {
  ...layoutStyles,
  ...textStyles,
  ...inputStyles,
};
