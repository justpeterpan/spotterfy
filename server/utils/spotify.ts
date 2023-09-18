import { H3Event } from 'h3'
import { Account } from '@prisma/client'
import pLimit from 'p-limit'

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

export async function $sp<T>(
  event: H3Event,
  endpoint: string,
  query?: QueryParams
): Promise<T | undefined> {
  const user = await getUserFromSession(event)

  if (!user?.access_token) return undefined
  return handleSpotifyRequest(endpoint, user.access_token, query) as T
}

export async function fetchAndSaveArtists(
  event: H3Event,
  userId: string,
  after: string | null = null
) {
  const response = await $sp<SpotifyApi.UsersFollowedArtistsResponse>(
    event,
    '/me/following',
    {
      type: 'artist',
      limit: 50,
      ...(after && { after: after }),
    }
  )
  // Store the Spotify artist IDs in a set.
  const currentBatchOfIds = new Set<string>(
    response?.artists.items.map((artist) => artist.id)
  )
  let allFetchedIds = new Set<string>([...currentBatchOfIds])

  // Recursively fetch all artists, if there's a next page.
  if (response?.artists.next) {
    const nextBatchOfIds = await fetchAndSaveArtists(
      event,
      userId,
      response.artists.cursors.after
    )
    allFetchedIds = new Set<string>([...allFetchedIds, ...nextBatchOfIds])
  }

  const limit = pLimit(5)

  // Save/update artists in the database and store them.
  if (response?.artists?.items.length) {
    const promises = response.artists.items.map((artist) =>
      limit(async () => {
        await prisma?.artist.upsert({
          where: { spotifyArtistId: artist.id },
          update: { artistName: artist.name },
          create: { spotifyArtistId: artist.id, artistName: artist.name },
        })

        await prisma?.artistFollow.upsert({
          where: {
            userId_artistId: {
              userId: userId,
              artistId: artist.id,
            },
          },
          update: {},
          create: { userId: userId, artistId: artist.id },
        })
      })
    )
    await Promise.all(promises)
  }

  return allFetchedIds
}

export async function getFollowedArtistsFromDB(userId: string) {
  const artists = await prisma?.artistFollow.findMany({
    where: { userId: userId },
    select: {
      artist: {
        select: {
          spotifyArtistId: true,
          artistName: true,
        },
      },
    },
  })

  return (
    artists?.map((artistFollow) => ({
      id: artistFollow.artist.spotifyArtistId,
      name: artistFollow.artist.artistName,
    })) || []
  )
}
