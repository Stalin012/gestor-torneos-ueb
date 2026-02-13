import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    base: './',
    plugins: [
        react({
            fastRefresh: false // Disable fast refresh to reduce HMR
        }),
        tailwindcss(),
    ],
    define: {
        'process.env': {}
    },
    server: {
        hmr: {
            overlay: false // Disable HMR overlay
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    }
});