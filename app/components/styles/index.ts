// Centralized style exports for the entire application
// Import all modular style files and re-export them

export { layoutStyles } from '../shared/styles/layout';
export { buttonStyles } from '../shared/styles/buttons';
export { inputStyles } from '../shared/styles/inputs';
export { modalStyles } from '../shared/styles/modals';
export { textStyles } from '../shared/styles/text';
export { exportStyles } from '../shared/styles/export';
export { settingsStyles } from '../shared/styles/settings';
export { menuStyles } from '../shared/styles/menus';

// Legacy combined styles export for backward compatibility
// This maintains compatibility with existing imports while encouraging migration to modular imports
import { layoutStyles } from '../shared/styles/layout';
import { buttonStyles } from '../shared/styles/buttons';
import { inputStyles } from '../shared/styles/inputs';
import { modalStyles } from '../shared/styles/modals';
import { textStyles } from '../shared/styles/text';
import { exportStyles } from '../shared/styles/export';
import { settingsStyles } from '../shared/styles/settings';
import { menuStyles } from '../shared/styles/menus';

// Combined styles object - matches the original 'styles' export structure
export const styles = {
  ...layoutStyles,
  ...buttonStyles,
  ...inputStyles,
  ...modalStyles,
  ...textStyles,
  ...exportStyles,
  ...settingsStyles,
  ...menuStyles,
};
