import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import {
  fauxTrending,
  feed,
  genreArtists,
  knownReposters,
  queryComments,
  queryPlaylists,
  queryTracks,
  queryUsers,
  userReposts,
} from './db'

const app = new Hono()

app.use(logger())

app.get('/api/users', async (c) => {
  const ids = c.req.queries('id')
  const q = c.req.query('q')
  const limit = c.req.query('limit') || '100'
  const users = await queryUsers({ ids, q, limit })
  return c.json(users)
})

app.get('/api/users/:handle', async (c) => {
  const myId = parseInt(c.req.header('x-my-id') || c.req.query('myId') || '')
  const handle = c.req.param('handle')
  const users = await queryUsers({ handle })
  const user = users[0]
  if (!user) return c.text('not found', 404)

  const [tracks, playlists] = await Promise.all([
    queryTracks({ myId, userId: user.id }),
    queryPlaylists({ userId: user.id }),
  ])
  return c.json({ user, playlists, tracks })
})

app.get('/api/users/:handle/comments', async (c) => {
  const handle = c.req.param('handle')
  const users = await queryUsers({ handle })
  const user = users[0]
  if (!user) return c.text('not found', 404)

  const comments = await queryComments({ userId: user.id })
  return c.json({ user, comments })
})

app.get('/api/feed/:uid', async (c) => {
  const userId = parseInt(c.req.param('uid'))
  const before = c.req.query('before')
  const rows = await feed(userId, before)
  return c.json(rows)
})

app.get('/api/users/:handle/reposts', async (c) => {
  const handle = c.req.param('handle')
  const users = await queryUsers({ handle })
  const user = users[0]
  if (!user) return c.text('not found', 404)

  const reposts = await userReposts(user.id)
  return c.json({
    user,
    reposts,
  })
})

app.get('/api/tracks/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const rows = await queryTracks({ ids: [id] })
  const track = rows[0]
  if (!track) return c.text('not found', 404)
  const comments = await queryComments({ trackId: track.id })
  return c.json({
    track,
    comments,
  })
})

app.get('/api/tracks/:id/known_reposters', async (c) => {
  const myId = parseInt(c.req.header('x-my-id') || '')
  const id = parseInt(c.req.param('id'))
  if (!myId || !id) return c.json([])
  const users = await knownReposters(myId, 'track', id)
  return c.json(users)
})

app.get('/api/explore/genres', async (c) => {
  const rows = await genreArtists()
  return c.json(rows)
})

app.get('/api/explore/tracks', async (c) => {
  const tracks = await fauxTrending()
  return c.json(tracks)
})

app.onError((err, c) => {
  return c.text(err.stack || err.message, 500)
})

serve({
  fetch: app.fetch,
  port: 4201,
})
