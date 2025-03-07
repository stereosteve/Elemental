import { serve } from '@hono/node-server'
import { Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { queryComments } from './db/query-comments'
import { feed } from './db/query-feed'
import { queryPlaylists } from './db/query-playlists'
import { queryTracks } from './db/query-tracks'
import { queryUsers } from './db/query-users'
import { genreArtists } from './db/top-genre-artists'
import { fauxTrending } from './db/top-tracks'
import { userReposts } from './db/user-reposts'
import { userLibrary } from './db/user-library'
import { sql } from './db/db'
import { queryMutuals } from './db/query-mutuals'

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
  const myId = getMyId(c)
  const handle = c.req.param('handle')
  const users = await queryUsers({ handle, myId })
  const user = users[0]
  if (!user) return c.text('not found', 404)

  // const [tracks, playlists] = await Promise.all([
  //   queryTracks({ myId, userId: user.id }),
  //   queryPlaylists({ userId: user.id }),
  // ])
  return c.json({ user })
})

app.get('/api/users/:handle/tracks', async (c) => {
  const myId = getMyId(c)
  const userId = await resolveUserId(c)
  const tracks = await queryTracks({ myId, userId })
  return c.json(tracks)
})

app.get('/api/users/:handle/playlists', async (c) => {
  const myId = getMyId(c)
  const userId = await resolveUserId(c)
  const playlists = await queryPlaylists({ myId, userId })
  return c.json(playlists)
})

app.get('/api/users/:handle/comments', async (c) => {
  const userId = await resolveUserId(c)
  const comments = await queryComments({ userId })
  return c.json({ comments })
})

app.get('/api/feed/:uid', async (c) => {
  const userId = parseInt(c.req.param('uid'))
  const before = c.req.query('before')
  const rows = await feed(userId, before)
  return c.json(rows)
})

app.get('/api/users/:handle/reposts', async (c) => {
  const myId = getMyId(c)
  const userId = await resolveUserId(c)
  const reposts = await userReposts({
    userId,
    myId,
  })
  return c.json({
    reposts,
  })
})

app.get('/api/users/:handle/mutuals', async (c) => {
  const myId = getMyId(c)
  const userId = await resolveUserId(c)
  const mutuals = await queryMutuals({ myId, userId })
  return c.json(mutuals)
})

app.get('/api/my/library', async (c) => {
  const myId = getMyId(c)
  const before = c.req.query('before')
  if (!myId) return c.text('not found', 404)

  const saves = await userLibrary({ userId: myId, myId, before })
  return c.json(saves)
})

app.get('/api/tracks/:id', async (c) => {
  const myId = getMyId(c)
  const id = parseInt(c.req.param('id'))
  const rows = await queryTracks({ ids: [id], myId })
  const track = rows[0]
  if (!track) return c.text('not found', 404)
  const comments = await queryComments({ trackId: track.id })
  return c.json({
    track,
    comments,
  })
})

app.get('/api/explore/genres', async (c) => {
  const rows = await genreArtists()
  return c.json(rows)
})

app.get('/api/explore/tracks', async (c) => {
  const myId = getMyId(c)
  const tracks = await fauxTrending({ myId })
  return c.json(tracks)
})

app.onError((err, c) => {
  return c.text(err.stack || err.message, 500)
})

function getMyId(c: Context) {
  const myId = parseInt(c.req.header('x-my-id') || c.req.query('myId') || '')
  return myId
}

const _resolveUserCache: Record<string, number> = {}
async function resolveUserId(c: Context) {
  const handle = c.req.param('handle')
  if (_resolveUserCache[handle]) return _resolveUserCache[handle]
  const users =
    await sql`select user_id from users where handle_lc = ${handle.toLowerCase()}`
  if (!users.length) return
  const { user_id } = users[0]
  _resolveUserCache[handle] = user_id
  return user_id
}

serve({
  fetch: app.fetch,
  port: 4201,
})
