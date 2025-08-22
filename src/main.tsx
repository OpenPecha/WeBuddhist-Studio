import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './providers/theme-provider.tsx'
import { PlanAuthProvider } from './config/auth-context.tsx'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PlanAuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </PlanAuthProvider>
    </QueryClientProvider>
  </StrictMode>
  </BrowserRouter>
)
