import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { makeServer } from './mirage/server.ts'

declare global {
  interface Window {
    __mirageReady?: boolean
  }
}

if (!window.__mirageReady) {
  makeServer()
  window.__mirageReady = true
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
