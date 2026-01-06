// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

import db from '@astrojs/db';

import react from '@astrojs/react';

const devToolbarEnabled = ["true", "on", "1"].includes(process.env.DEV_TOOLBAR_ENABLED?.toLowerCase() ?? 'false');

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: devToolbarEnabled
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [db(), react()],

  security: {
    checkOrigin: false
  }
});