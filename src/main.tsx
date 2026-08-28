import { enableMapSet } from 'immer';
import { createRoot } from 'react-dom/client';

enableMapSet();

import App from './App';

import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
