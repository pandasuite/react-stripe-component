import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import PandaBridge from 'pandasuite-bridge';
import { PandaBridgeRoot } from 'pandasuite-bridge-react';
import './index.css';
import App from './App';

import IntlProvider from './components/IntlProvider';

PandaBridge.followStudioAppearance();

ReactDOM.render(<PandaBridgeRoot><IntlProvider><App /></IntlProvider></PandaBridgeRoot>, document.getElementById('root'));
