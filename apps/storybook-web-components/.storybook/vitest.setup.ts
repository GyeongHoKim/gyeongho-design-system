import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/web-components-vite';
import * as previewAnnotations from './preview';

setProjectAnnotations([previewAnnotations, a11yAddonAnnotations]);
