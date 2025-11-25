import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './components/ui/ToastProvider';
import { ProfileProvider } from './contexts/ProfileContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </ToastProvider>
  </StrictMode>,
);
