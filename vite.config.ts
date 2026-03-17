import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Configurable at build time — set BACKEND_URL in Railway env vars.
// Falls back to localhost:8000 for local development.
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      routeRules: {
        '/api/**': { proxy: `${BACKEND_URL}/api/**` },
        '/media/**': { proxy: `${BACKEND_URL}/media/**` },
      },
    }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
