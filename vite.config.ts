import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const DEFAULT_PORT = 5199

/** Reads APP_PORT from .env; rejects anything that is not a valid TCP port. */
function readPort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT
  const port = Number(value)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`APP_PORT must be a whole number between 1 and 65535 (got "${value}"). Check your .env file.`)
  }
  return port
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads .env, .env.local and .env.[mode]. Only VITE_* values reach the browser bundle.
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_'])
  // strictPort: fail loudly if the configured port is busy instead of silently moving to another one.
  const server = { port: readPort(env.APP_PORT), host: env.APP_HOST || 'localhost', strictPort: true }

  return {
    plugins: [react(), tailwindcss()],
    server,
    preview: server,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Long-lived vendor chunks cache well across app deploys; charts load only with chart pages.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/ },
              { name: 'state', test: /node_modules[\\/](@reduxjs|react-redux|redux|immer|reselect)[\\/]/ },
              { name: 'charts', test: /node_modules[\\/](recharts|d3-[a-z]+|victory-vendor)[\\/]/ },
              { name: 'forms', test: /node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/ },
              { name: 'lottie', test: /node_modules[\\/]lottie-web[\\/]/ },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  }
})
