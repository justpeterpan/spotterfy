import SpotifyProvider from '@auth/core/providers/spotify'
import type { AuthConfig } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'
import { JWT } from '@auth/core/jwt'

const runtimeConfig = useRuntimeConfig()

// TODO implement refresh machnism
async function refreshToken(authToken: JWT) {}

export const authOptions: AuthConfig = {
  secret: runtimeConfig.authJs.secret,
  providers: [
    SpotifyProvider({
      clientId: runtimeConfig.spotify.clientId,
      clientSecret: runtimeConfig.spotify.clientSecret,
      authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-currently-playing,user-read-recently-played,user-top-read,user-read-email',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const authToken = {
        ...token,
      }
      if (account?.access_token) {
        authToken.access_token = account.access_token
      }

      if (account?.refresh_token) {
        authToken.refresh_token = account.refresh_token
      }

      if (account?.expires_at) {
        authToken.expires_at = account.expires_at
      }

      return authToken
    },
  },
}

export default NuxtAuthHandler(authOptions, runtimeConfig)
