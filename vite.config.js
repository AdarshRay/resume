import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist') || id.includes('mammoth') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'document-tools';
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
