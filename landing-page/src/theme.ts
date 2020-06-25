import { theme } from '@chakra-ui/core';

const breakpoints = ['360px', '768px', '1024px', '1440px'];
const breakpointsObject: any = {};
breakpointsObject.sm = breakpoints[0];
breakpointsObject.md = breakpoints[1];
breakpointsObject.lg = breakpoints[2];
breakpointsObject.xl = breakpoints[3];

const tzTipTheme = {
  ...theme,
  breakpointsObject,
};

export { tzTipTheme };
