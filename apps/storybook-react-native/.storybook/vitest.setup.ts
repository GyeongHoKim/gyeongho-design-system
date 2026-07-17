import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-native-web-vite';
import * as previewAnnotations from './preview';

setProjectAnnotations([previewAnnotations, a11yAddonAnnotations]);
