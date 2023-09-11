import { createRouter, defineEventHandler, useBase } from 'h3'

const router = createRouter()

router.get(
  '/track',
  defineEventHandler(async (event) => {
    const { id } = getQuery(event)
    return $sp(event, `/tracks/${id}`)
  })
)

router.get(
  '/plays',
  defineEventHandler(async (event) => {
    return $sp(event, '/me/player/recently-played', {
      limit: 5,
      before: Date.now(),
    })
  })
)

router.get(
  '/follows',
  defineEventHandler(async (event) => {
    return $sp(event, '/me/following', {
      type: 'artist',
      limit: 50,
    })
  })
)

export default useBase('/api/spotify/', router.handler)
