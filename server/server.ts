import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { queryComments } from './db/query-comments'
import { feed } from './db/query-feed'
import { queryPlaylists } from './db/query-playlists'
import { queryTracks } from './db/query-tracks'
import { queryUsers, UserQueryParser } from './db/query-users'
import { genreArtists } from './db/top-genre-artists'
import { fauxTrending } from './db/top-tracks'
import { userReposts } from './db/user-reposts'
import { userLibrary } from './db/user-library'
import { sql } from './db/db'
import { queryMutuals } from './db/query-mutuals'
import { readFile } from 'fs/promises'
import { queryPlayHistory } from './db/user-play-history'
import searchRoutes from './server_search'
import { validator } from 'hono/validator'

const app = new Hono()

app.use(logger())

app.route('', searchRoutes)

app.get(
  '/api/users',
  validator('query', (value) => UserQueryParser.parse(value)),
  async (c) => {
    const query = c.req.valid('query')
    query.limit ||= 100
    const users = await queryUsers(query)
    return c.json(users)
  }
)

app.get('/api/users/:handle', async (c) => {
  const myId = await getMyId(c)
  const handle = c.req.param('handle')
  const users = await queryUsers({ handle, myId })
  const user = users[0]
  if (!user) return c.text('not found', 404)
  return c.json({ user })
})

app.get('/api/users/:handle/tracks', async (c) => {
  const myId = await getMyId(c)
  const userId = await resolveUserId(c)
  const tracks = await queryTracks({ myId, userId })
  return c.json(tracks)
})

app.get('/api/users/:handle/playlists', async (c) => {
  const myId = await getMyId(c)
  const userId = await resolveUserId(c)
  const playlists = await queryPlaylists({ myId, userId })
  return c.json(playlists)
})

app.get('/api/users/:handle/comments', async (c) => {
  const userId = await resolveUserId(c)
  const comments = await queryComments({ userId })
  return c.json({ comments })
})

app.get('/api/feed', async (c) => {
  const myId = await getMyId(c)
  const before = c.req.query('before')
  const rows = await feed(myId, before)
  return c.json(rows)
})

app.get('/api/users/:handle/reposts', async (c) => {
  const myId = await getMyId(c)
  const userId = await resolveUserId(c)
  const reposts = await userReposts({
    userId,
    myId,
    before: c.req.query('before'),
  })
  return c.json(reposts)
})

app.get('/api/users/:handle/mutuals', async (c) => {
  const myId = await getMyId(c)
  const userId = await resolveUserId(c)
  const mutuals = await queryMutuals({ myId, userId })
  return c.json(mutuals)
})

app.get('/api/my/library', async (c) => {
  const myId = await getMyId(c, true)
  const before = c.req.query('before')

  const saves = await userLibrary({ userId: myId, myId, before })
  return c.json(saves)
})

app.get('/api/my/play-history', async (c) => {
  const myId = await getMyId(c, true)
  const before = c.req.query('before')
  const rows = await queryPlayHistory({ userId: myId, myId, before })
  return c.json(rows)
})

app.get('/api/tracks/:id', async (c) => {
  const myId = await getMyId(c)
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
  c.header('Cache-Control', 'max-age=3600')
  return c.json(rows)
})

app.get('/api/explore/tracks', async (c) => {
  const myId = await getMyId(c)
  const tracks = await fauxTrending({ myId })
  return c.json(tracks)
})

//
// SPA Handler
//
app.use(serveStatic({ root: './dist' }))
const indexHtml = readFile('dist/index.html', 'utf8')
app.get('*', async (c) => c.html(await indexHtml))

app.onError((err, c) => {
  return c.text(err.stack || err.message, 500)
})

//
//
//
function getMyId(c: Context, required?: boolean) {
  const queryUserId = parseInt(c.req.query('myId') || '')
  if (queryUserId) return queryUserId
  const myHandle = c.req.header('x-my-handle') || c.req.query('myHandle') || ''
  if (required && !myHandle) throw new Error('myId is required')
  return resolveHandle(myHandle)
}

async function resolveUserId(c: Context) {
  return resolveHandle(c.req.param('handle'))
}

const _resolveUserCache: Record<string, number> = {}
async function resolveHandle(handle: string) {
  if (!handle) return
  if (_resolveUserCache[handle]) return _resolveUserCache[handle]
  const users =
    await sql`select user_id from users where handle_lc = ${handle.toLowerCase()}`.values()
  if (!users.length) return
  const [userId] = users[0]
  _resolveUserCache[handle] = userId
  return userId
}

const port = 4201
console.log(`serving on ${port}`)
serve({
  fetch: app.fetch,
  port,
})
