import { authOptions } from '../auth/[...]'
import { getServerToken } from '#auth'

function currentTime(): number {
  return Date.now()
}

export default defineEventHandler(async (event) => {
  const token = await getServerToken(event, authOptions)
  if (!token) return undefined

  const $sp = $fetch.create({
    baseURL: 'https://api.spotify.com/v1/me',
    headers: { Authorization: `Bearer ${token?.access_token}` },
  })

  const topItems: SpotifyApi.UsersTopTracksResponse = await $sp('/top/tracks', {
    query: {
      time_range: 'short_term',
      limit: 5,
      offset: 0,
    },
  })

  const recentlyPlayed: SpotifyApi.UsersRecentlyPlayedTracksResponse =
    await $sp('/player/recently-played', {
      query: {
        limit: 5,
        before: currentTime(),
      },
    })

  return { topItems, recentlyPlayed }
})
