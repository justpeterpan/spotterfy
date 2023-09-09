import { resolve } from 'node:path'

export default defineNuxtConfig({
  modules: ['@hebilicious/authjs-nuxt', '@nuxtjs/tailwindcss'],
  nitro: {
    preset: 'bun',
  },
  authJs: {
    baseUrl: process.env.NEXTAUTH_URL,
    verifyClientOnEveryRequest: true,
  },
  experimental: {
    viewTransition: true,
  },
  devtools: { enabled: false },
  runtimeConfig: {
    authJs: {
      secret: process.env.NUXT_NEXTAUTH_SECRET,
    },
    spotify: {
      clientId: process.env.NUXT_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.NUXT_SPOTIFY_CLIENT_SECRET,
    },
    public: {
      authJs: {
        baseUrl: process.env.NUXT_NEXTAUTH_URL,
      },
    },
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie'),
  },
})
