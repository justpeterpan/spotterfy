import SpotifyProvider from '@auth/core/providers/spotify'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Account, PrismaClient, User } from '@prisma/client'
import type { AuthConfig, TokenSet } from '@auth/core/types'
import { NuxtAuthHandler } from '#auth'

const runtimeConfig = useRuntimeConfig()
const prisma = new PrismaClient()

export const authOptions: AuthConfig = {
  secret: runtimeConfig.authJs.secret,
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/login',
  },
  providers: [
    SpotifyProvider({
      clientId: runtimeConfig.spotify.clientId,
      clientSecret: runtimeConfig.spotify.clientSecret,
      authorization:
        'https://accounts.spotify.com/authorize?scope=user-read-currently-playing,user-read-recently-played,user-read-email,user-follow-read',
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session || !user) {
        return session
      }

      const [sessionUser]: Array<Account> = await prisma.account.findMany({
        where: {
          userId: user.id,
        },
      })

      const now = Math.floor(Date.now() / 1000)
      const expiresAt = sessionUser.expires_at || 0
      const difference = Math.floor((expiresAt - now) / 60)
      const refreshToken = sessionUser.refresh_token

      if (difference <= 10) {
        try {
          const request = await fetch(
            'https://accounts.spotify.com/api/token',
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: runtimeConfig.spotify.clientId,
                grant_type: 'refresh_token',
                refresh_token: refreshToken || '',
              }),
              method: 'POST',
            }
          )
          const tokens: TokenSet = await request.json()
          if (!request.ok) throw tokens

          await prisma.account.update({
            data: {
              access_token: tokens.access_token,
              expires_at: Math.floor(
                Date.now() / 1000 + (tokens.expires_in || 0)
              ),
              refresh_token: tokens.refresh_token ?? sessionUser.refresh_token,
            },
            where: {
              provider_providerAccountId: {
                provider: 'spotify',
                providerAccountId: sessionUser.providerAccountId,
              },
            },
          })
        } catch (error) {
          console.error('error refreshing access token', error)
        }
      }

      return session
    },
  },
}

export default NuxtAuthHandler(authOptions, runtimeConfig)
