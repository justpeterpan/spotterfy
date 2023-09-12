import { createRouter, defineEventHandler, useBase } from 'h3'
import pLimit from 'p-limit'

const router = createRouter()

router.get(
  '/track',
  defineEventHandler(async (event) => {
    const { id } = getQuery(event)
    return $sp<SpotifyApi.TrackObjectFull>(event, `/tracks/${id}`)
  })
)

router.get(
  '/plays',
  defineEventHandler(async (event) => {
    return $sp<SpotifyApi.UsersRecentlyPlayedTracksResponse>(
      event,
      '/me/player/recently-played',
      {
        limit: 5,
        before: Date.now(),
      }
    )
  })
)

router.get(
  '/follows',
  defineEventHandler(async (event) => {
    const limit = pLimit(5)
    const session = await getAuthSession(event)
    const [user] = (await getUser(session)) || []
    const response = await $sp<SpotifyApi.UsersFollowedArtistsResponse>(
      event,
      '/me/following',
      {
        type: 'artist',
        limit: 50,
      }
    )
    const promises = response?.artists.items.map((artist) => {
      return limit(async () => {
        await prisma?.artist.upsert({
          where: { spotifyArtistId: artist.id },
          update: { artistName: artist.name },
          create: { spotifyArtistId: artist.id, artistName: artist.name },
        })

        await prisma?.artistFollow.upsert({
          where: {
            userId_artistId: {
              userId: user.providerAccountId,
              artistId: artist.id,
            },
          },
          update: {},
          create: { userId: user.providerAccountId, artistId: artist.id },
        })
      })
    })

    if (promises) {
      await Promise.all(promises)
    }

    return response
  })
)

router.get(
  '/releases',
  defineEventHandler(async (event) => {
    const followedArtists = await prisma?.user.findMany({
      where: {
        name: 'rainertitan',
      },
      select: {
        followedArtists: {
          select: {
            artist: {
              select: {
                artistName: true,
                spotifyArtistId: true,
              },
            },
          },
        },
      },
    })

    const fetchReleases = async (artistId: string) => {
      return await $sp(event, `/artists/${artistId}/albums`, {
        include_groups: 'album,single',
        market: 'DE',
        limit: 50,
      })
    }

    const allReleasesPromises = followedArtists![0]?.followedArtists.map(
      (artist) => fetchReleases(artist.artist.spotifyArtistId)
    )
    const allReleases = await Promise.all(allReleasesPromises)

    const groupedByArtist = {}

    followedArtists![0]?.followedArtists.forEach((artist, index) => {
      groupedByArtist[artist.artist.artistName] = allReleases[index]
    })

    console.log(groupedByArtist)

    if (followedArtists?.length) return groupedByArtist
    return {}
  })
)

export default useBase('/api/spotify/', router.handler)
