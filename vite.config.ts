import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Proxy ke Cloud Bridge supaya browser bicara ke origin yang sama.
// Dengan begitu TIDAK perlu mengaktifkan CORS di server.
const proxy = {
  '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true },
  '/healthz': { target: 'http://127.0.0.1:8080', changeOrigin: true },
  '/readyz': { target: 'http://127.0.0.1:8080', changeOrigin: true },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host dipatok ke IPv4: di Windows, 'localhost' sering mengikat ke ::1 saja
  // sehingga 127.0.0.1 ditolak (net::ERR_CONNECTION_REFUSED).
  server: { host: '127.0.0.1', port: 5174, proxy },
  preview: { host: '127.0.0.1', port: 4174, proxy },
  // Untuk produksi di domain TERPISAH dari API, isi VITE_API_BASE
  // (lihat .env.example). Kalau satu domain (nginx), biarkan kosong.
  build: { outDir: 'dist', sourcemap: false },
})
