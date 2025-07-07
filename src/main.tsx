
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

// Expose Supabase client globally for extension communication
(window as any).supabase = supabase;
(window as any).supabaseAuth = supabase.auth;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
