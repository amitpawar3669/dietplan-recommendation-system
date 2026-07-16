import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
  },
  resolve: {
    dedupe: ['styled-components', 'react', 'react-dom'], // force single instances
    alias: {
      'styled-components': 'styled-components',
    }
  },
  optimizeDeps: {
    include: ['styled-components'],
  },
})
