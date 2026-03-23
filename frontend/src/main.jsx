import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey =
  typeof PUBLISHABLE_KEY === 'string' &&
  PUBLISHABLE_KEY.startsWith('pk_') &&
  !PUBLISHABLE_KEY.includes('placeholder-clerk-publishable-key');

const queryClient = new QueryClient();
const rootElement = document.getElementById('root');

function ClerkSetupError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Clerk Configuration Required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The frontend is trying to start Clerk with an invalid publishable key.
        </p>
        <div className="mt-6 rounded-xl bg-muted p-4 font-mono text-sm">
          VITE_CLERK_PUBLISHABLE_KEY=your_real_clerk_publishable_key
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Create a <code>.env</code> file inside <code>frontend</code>, add your real Clerk publishable key,
          then restart <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {isValidClerkKey ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    ) : (
      <ClerkSetupError />
    )}
  </React.StrictMode>,
);
