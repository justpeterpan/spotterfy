import { resolve } from 'node:path'

export default defineNuxtConfig({
  modules: ['@hebilicious/authjs-nuxt', '@nuxtjs/tailwindcss'],
  nitro: {
    routeRules: {
      '/': { ssr: true, prerender: true },
    },
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
        verifyClientOnEveryRequest: true,
      },
    },
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie'),
  },
})
