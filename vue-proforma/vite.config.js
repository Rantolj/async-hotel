import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
    proxy: {
      // Proxy vers le servlet Java EE (GlassFish/WildFly)
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // Réécrire /api -> /asynclocation/api pour atteindre le servlet déployé
        rewrite: (path) => path.replace(/^\/api/, '/asynclocation/api'),
        onError(err, req, res) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end('Proxy error: ' + (err?.code || 'Unknown'))
        }
      }
    },
    hmr: { overlay: false }
  }
})
