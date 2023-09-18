import { createRouter, defineEventHandler, useBase } from 'h3'
import { fetchAndSaveArtists } from '~/server/utils/spotify'
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

type SimpleFollowedArtist = {
  userId: string
  artistId: string
}

router.get(
  '/update-follows',
  defineEventHandler(async (event) => {
    const session = await getAuthSession(event)
    const [user] = (await getUser(session)) || []
    const fetchedArtists = await fetchAndSaveArtists(
      event,
      user.providerAccountId
    )
    const dbFollowedArtists: Array<SimpleFollowedArtist> | undefined =
      await prisma?.artistFollow.findMany({
        where: { userId: user.providerAccountId },
      })

    console.log('sp follows', fetchedArtists)
    console.log('db follows', dbFollowedArtists)

    const dbArtistIds =
      dbFollowedArtists?.map((artist) => artist?.artistId) || []

    for (const dbArtistId of dbArtistIds) {
      if (!fetchedArtists.has(dbArtistId)) {
        await prisma?.artistFollow.deleteMany({
          where: {
            userId: user.providerAccountId,
            artistId: dbArtistId,
          },
        })
      }
    }

    return fetchedArtists.entries
  })
)

router.get(
  '/followed',
  defineEventHandler(async (event) => {
    const session = await getAuthSession(event)
    const [user] = (await getUser(session)) || []
    const dbFollowedArtists:
      | Array<
          SimpleFollowedArtist & {
            artist: { spotifyArtistId: string; artistName: string }
          }
        >
      | undefined = await prisma?.artistFollow.findMany({
      where: { userId: user.providerAccountId },
      include: { artist: true },
    })
    const allArtists = dbFollowedArtists?.map((artist) => artist.artist)

    const fetchReleases = async (artistId: string) => {
      return await $sp<Promise<SpotifyApi.ArtistsAlbumsResponse>>(
        event,
        `/artists/${artistId}/albums`,
        {
          include_groups: 'album,single',
          market: 'DE',
          limit: 50,
        }
      )
    }
    // const limit = pLimit(2)
    // const allReleasesPromises = allArtists?.map((artist) =>
    //   limit(async () => {
    //     const releases = await fetchReleases(artist.spotifyArtistId)
    //     console.log(releases)
    //     return releases
    //   })
    // )
    // const allReleases = await Promise.all(allReleasesPromises!)

    const groupedByArtist: Array<{
      name: string
      releases: SpotifyApi.ArtistsAlbumsResponse['items'] | undefined
    }> = []

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    // Make sequential requests
    if (allArtists?.length) {
      for (const artist of allArtists) {
        console.log('artist', artist.artistName)
        const releases = await fetchReleases(artist.spotifyArtistId)
        groupedByArtist.push({
          name: artist.artistName,
          releases: releases?.items,
        })

        if (releases) {
          for (const release of releases.items) {
            await prisma?.release.upsert({
              where: { spotifyReleaseId: release.id },
              update: {
                releaseName: release.name,
                releaseDate: new Date(release.release_date), // Convert string to Date object
                spotifyReleaseUrl: release.href, // assuming href is the URL, please replace with correct property if it's different
                artistId: artist.spotifyArtistId,
              },
              create: {
                spotifyReleaseId: release.id,
                artistId: artist.spotifyArtistId,
                releaseName: release.name,
                releaseDate: new Date(release.release_date),
                spotifyReleaseUrl: release.href,
              },
            })
          }
        }
        console.log(groupedByArtist, artist.artistName)
        await delay(1000)
      }
    }

    return groupedByArtist
  })
)

router.get(
  '/releases',
  defineEventHandler(async (event) => {
    const today = new Date()
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(today.getDate() - 3)

    const releases = await prisma?.release.findMany({
      where: {
        releaseDate: {
          gte: threeDaysAgo,
          lte: today,
        },
      },
      include: {
        artist: true,
      },
    })
    const releaseIds = releases
      ?.map((release) => release.spotifyReleaseId)
      .join(',')

    const albums = await $sp<SpotifyApi.MultipleAlbumsResponse>(
      event,
      '/albums',
      {
        ids: releaseIds!,
        market: 'DE',
      }
    )

    return { ...albums, date: today }
  })
)

router.get(
  '/albums',
  defineEventHandler(async (event) => {})
)

// router.get(
//   '/releases',
//   defineEventHandler(async (event) => {
//     const followedArtists = await prisma?.user.findMany({
//       where: {
//         name: 'rainertitan',
//       },
//       select: {
//         followedArtists: {
//           select: {
//             artist: {
//               select: {
//                 artistName: true,
//                 spotifyArtistId: true,
//               },
//             },
//           },
//         },
//       },
//     })

//     const fetchReleases = async (artistId: string) => {
//       return await $sp(event, `/artists/${artistId}/albums`, {
//         include_groups: 'album,single',
//         market: 'DE',
//         limit: 50,
//       })
//     }

//     const allReleasesPromises = followedArtists![0]?.followedArtists.map(
//       (artist) => fetchReleases(artist.artist.spotifyArtistId)
//     )
//     const allReleases = await Promise.all(allReleasesPromises)

//     const groupedByArtist = []

//     followedArtists![0]?.followedArtists.forEach((artist, index) => {
//       groupedByArtist.push({
//         name: artist.artist.artistName,
//         releases: allReleases[index].items,
//       })
//     })

//     if (followedArtists?.length) return groupedByArtist
//     return {}
//   })
// )

export default useBase('/api/spotify/', router.handler)
