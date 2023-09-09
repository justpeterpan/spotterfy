import { authOptions } from '../auth/[...]'
import { getServerToken } from '#auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = await getServerToken(event, authOptions)
  if (!token) return undefined

  async function getTrack(): Promise<SpotifyApi.TrackObjectFull> {
    return $fetch(`https://api.spotify.com/v1/tracks/${query.id}`, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    })
  }
  const track = await getTrack()

  return track
})
