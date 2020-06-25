import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { ThemeProvider, CSSReset } from '@chakra-ui/core';

import { tzTipTheme } from './theme';

const ThemedApp = () => (
  <ThemeProvider theme={tzTipTheme}>
    <React.StrictMode>
      <CSSReset />
      <App />
    </React.StrictMode>
  </ThemeProvider>
);

ReactDOM.render(<ThemedApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
