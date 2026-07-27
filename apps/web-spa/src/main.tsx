// apps/web-spa/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root 를 찾지 못했습니다');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
