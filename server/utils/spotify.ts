import { H3Event } from 'h3'
import { Account } from '@prisma/client'

type QueryParams = {
  [key: string]: string | number | boolean
}

async function getUserFromSession(
  event: H3Event
): Promise<Account | undefined> {
  const session = await getAuthSession(event)
  const [user] = (await getUser(session)) || []
  return user
}

async function handleSpotifyRequest(
  endpoint: string,
  accessToken: string,
  query?: QueryParams
) {
  return $fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    query,
  })
}

export async function $sp(
  event: H3Event,
  endpoint: string,
  query?: QueryParams
) {
  const user = await getUserFromSession(event)

  if (!user?.access_token) return undefined
  return handleSpotifyRequest(endpoint, user.access_token, query)
}
