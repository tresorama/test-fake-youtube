import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/error-boundary.tsx';
import { TanstackRouterProvider } from './lib/tanstack-router-provider.tsx';
import { TanstackQueryProvider } from './lib/tanstack-query-provider.tsx';
import './index.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TanstackQueryProvider>
        <TanstackRouterProvider />
      </TanstackQueryProvider>
    </ErrorBoundary>
  </StrictMode>
);