import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import { AppProvider } from './providers/AppProvider.tsx';
import { ErrorBoundary } from '../shared/components/ErrorBoundary.tsx';
import { ToastProvider } from '../shared/components/Toast.tsx';
import '../assets/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/:tab" element={<App />} />
              <Route path="*" element={<Navigate to="/quests" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

