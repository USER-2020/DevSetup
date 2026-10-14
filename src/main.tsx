import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles.css';
import './settings-overrides.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
