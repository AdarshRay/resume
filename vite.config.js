import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) {
              return 'pdf-tools';
            }
            if (id.includes('mammoth')) {
              return 'docx-tools';
            }
            if (id.includes('jspdf')) {
              return 'pdf-export';
            }
            if (id.includes('html2canvas')) {
              return 'canvas-export';
            }
            if (id.includes('@dnd-kit') || id.includes('react-dnd')) {
              return 'editor-dnd';
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }
          }
          if (id.includes('/src/templates/')) {
            return 'resume-templates';
          }
          return undefined;
        },
      },
    },
  },
});
