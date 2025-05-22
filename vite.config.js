import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist', // Output directory for production build
    rollupOptions: {
      input: {
        main: './index.html', // Your main HTML file
        products: './products.html', // Your products HTML file
        order: './order.html',
        contact: './contact.html',
        about: './about.html',
        // Add other HTML files here if you have them, e.g., about: './about.html'
      },
    },
  },
});