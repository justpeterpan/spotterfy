import { resolve } from 'node:path'

export default defineNuxtConfig({
  modules: [
    '@hebilicious/authjs-nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/html-validator',
  ],
  nitro: {
    preset: 'vercel',
  },
  app: {
    head: {
      charset: 'utf-8',
      htmlAttrs: {
        lang: 'en-US',
      },
      title: 'Recently Played',
    },
  },
  authJs: {
    baseUrl: process.env.NEXTAUTH_URL,
    verifyClientOnEveryRequest: false,
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
  htmlValidator: {
    logLevel: 'verbose',
  },
  image: {
    domains: ['i.scdn.co'],
  },
  alias: {
    cookie: resolve(__dirname, 'node_modules/cookie'),
  },
})
