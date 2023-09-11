import { createRouter, defineEventHandler, useBase } from 'h3'
import { Account } from '@prisma/client'
const router = createRouter()

function currentTime(): number {
  return Date.now()
}

router.get(
  '/track',
  defineEventHandler(async (event) => {
    const { id } = getQuery(event)
    const session = await getAuthSession(event)
    const user: Array<Account> | undefined = await getUser(session)

    if (!user) return undefined
    return $fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${user[0]?.access_token}`,
      },
    })
  })
)

router.get(
  '/plays',
  defineEventHandler(async (event) => {
    console.log('plays')
    const session = await getAuthSession(event)

    const user: Array<Account> | undefined = await getUser(session)
    if (!user) return undefined

    return $fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${user[0]?.access_token}`,
      },
      query: {
        limit: 5,
        before: currentTime(),
      },
    })
  })
)

export default useBase('/api/spotify/', router.handler)
