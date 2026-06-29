/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is deployed to GitHub Pages as a project site:
//   https://kinect1things.github.io/ai-901/
// so all assets must be served from the "/ai-901/" base path in production.
// Locally (dev/preview) we serve from "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ai-901/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
}))
