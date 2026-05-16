import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { AppProvider } from './providers/AppProvider.tsx';
import { AudioProvider } from './providers/AudioProvider.tsx';
import { ErrorBoundary } from '../shared/components/ErrorBoundary.tsx';
import { ToastProvider } from '../shared/components/Toast.tsx';
import '../assets/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AudioProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/:tab" element={<App />} />
                <Route path="*" element={<Navigate to="/quests" replace />} />
              </Routes>
            </BrowserRouter>
          </AudioProvider>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

