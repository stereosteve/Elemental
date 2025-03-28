import { Context, Hono } from 'hono'
import { client } from './search/opensearch-client'
import { QueryContainer } from '@opensearch-project/opensearch/api/_types/_common.query_dsl.js'
import { sortCodec } from '@/lib/sortCodec'

const app = new Hono()

const FIELD_MAPPING: Record<string, string> = {
  title: 'title.keyword',
  artist: 'user.name.keyword',
  // tanstack table does this...
  user_followerCount: 'user.followerCount',
  genre: 'genre.keyword',
  musicalKey: 'musicalKey',
  bpm: 'bpm',
  user_location: 'user.location.keyword',
}

app.get('/api/suggest', async (c) => {
  let q = c.req.query('q')
  if (!q) return c.json([])

  q = q.toLowerCase()

  const [tracks, users, playlists] = await Promise.all(
    ['tracks', 'users', 'playlists'].map((index) => {
      // todo: we'll probably just want separate dsl for each collection
      const sortField = index == 'users' ? 'followerCount' : 'repostCount'
      return client
        .search({
          index,
          body: {
            query: buildQueryContainer(c),
            size: 5,
            sort: [{ [sortField]: 'desc' }],
          },
        })
        .then((r) => r.body.hits.hits.map((h) => h._source))
    })
  )

  return c.json({
    tracks,
    users,
    playlists,
  })
})

app.get('/api/search', async (c) => {
  const from = parseInt(c.req.query('from') || '0')

  let sort: Record<string, string>[] = [
    { repostCount: 'desc' },
    // { 'title.keyword': 'asc' },
  ]

  const querySort = c.req.query('sort')
  if (querySort) {
    const sortObjs = sortCodec.decode(querySort)
    if (sortObjs.length) {
      sort = sortObjs.map((row) => {
        const k = FIELD_MAPPING[row.id] || row.id
        return { [k]: row.desc ? 'desc' : 'asc' }
      })
      console.log(sort)
    }
  }

  // const dsl = buildQueryContainer(c)
  // return c.json(dsl)

  const found = await client.search({
    index: 'tracks',
    body: {
      query: buildQueryContainer(c),
      size: 200,
      from: from,
      sort,
    },
  })
  return c.json(found)
})

app.get('/api/search/count', async (c) => {
  const resp = await client.count({
    index: 'tracks',
    body: {
      query: buildQueryContainer(c),
    },
  })
  return c.json(resp.body.count)
})

app.get('/api/search/facet/:fieldName', async (c) => {
  const fieldName = c.req.param('fieldName')
  const facets = await facetField(c, fieldName)
  return c.json(facets)
})

async function facetField(c: Context, fieldName: string) {
  const found = await client.search({
    index: 'tracks',
    body: {
      query: buildQueryContainer(c, fieldName),
      size: 0,

      aggs: {
        [fieldName]: {
          terms: {
            field: FIELD_MAPPING[fieldName],
            size: 1500,
          },
        },
      },
    },
  })

  // @ts-ignore
  return found.body.aggregations[fieldName].buckets.filter((b) =>
    Boolean(b.key)
  )
}

// build query dsl from params
// with option to omit a field for sake of aggregation...
function buildQueryContainer(c: Context, omitFilter?: string) {
  const must: QueryContainer[] = []
  const filter: QueryContainer[] = []

  if (c.req.query('remix') == 'true') {
    filter.push({
      exists: { field: 'remixOf' },
    })
  }

  if (c.req.query('download') == 'true') {
    filter.push({
      term: {
        isDownloadable: 'true',
      },
    })
  }

  for (const [queryKey, osKey] of Object.entries(FIELD_MAPPING)) {
    if (queryKey == omitFilter) continue
    const terms = c.req.queries(queryKey)?.filter(Boolean)
    if (terms?.length) {
      filter.push({
        terms: {
          [osKey]: terms,
        },
      })
    }
  }

  const advanced = c.req.query('advanced')
  if (advanced) {
    must.push({
      query_string: {
        query: advanced,
      },
    })
  }

  const q = (c.req.query('q') || '').trim()

  const dsl: QueryContainer = {
    bool: {
      must,
      should: [
        {
          simple_query_string: {
            query: q + '*',
            default_operator: 'AND',
          },
        },
        {
          simple_query_string: {
            query: q.replace(/\s+/g, '') + '*',
          },
        },
      ],
      filter,
    },
  }

  return dsl
}

export default app
