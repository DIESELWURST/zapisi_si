import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Expose to network
    port: 5173, // Specify port
  },
  build: {
    outDir: 'dist',
  },
})
