import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/web-dev-dz-itog',
  plugins: [react()],
})
