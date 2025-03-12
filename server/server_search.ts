import { Context, Hono } from 'hono'
import { client } from './search/opensearch-client'
import { QueryContainer } from '@opensearch-project/opensearch/api/_types/_common.query_dsl.js'

const app = new Hono()

const FIELD_MAPPING: Record<string, string> = {
  title: 'title.keyword',
  artist: 'user.name.keyword',
  genre: 'genre.keyword',
  musicalKey: 'musicalKey',
  bpm: 'bpm',
}

app.get('/api/search', async (c) => {
  const from = parseInt(c.req.query('from') || '0')

  let sort: Record<string, string>[] = [
    { repostCount: 'desc' },
    // { 'title.keyword': 'asc' },
  ]

  const querySort = c.req.query('sort')
  if (querySort) {
    const sortObjs = JSON.parse(querySort) as { id: string; desc: boolean }[]
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

app.get('/api/search/facet', async (c) => {
  const fields = ['genre', 'artist', 'bpm', 'musicalKey']
  // const fields = ['bpm']
  const facets = await Promise.all(fields.map((f) => facetField(c, f)))
  const keyedFacets = Object.fromEntries(fields.map((f, i) => [f, facets[i]]))
  return c.json(keyedFacets)
})

async function facetField(c: Context, fieldName: string) {
  const found = await client.search({
    index: 'tracks',
    body: {
      query: buildQueryContainer(c),
      size: 0,

      aggs: {
        [fieldName]: {
          terms: {
            field: FIELD_MAPPING[fieldName],
            size: 1000,
          },
        },
      },
    },
  })

  // @ts-ignore
  return found.body.aggregations[fieldName].buckets
}

// build query dsl from params
// with option to omit a field for sake of aggregation...
function buildQueryContainer(c: Context, omitFilter?: string) {
  const dsl: QueryContainer = {
    bool: {
      must: [
        {
          simple_query_string: {
            query: (c.req.query('q') || '') + '*',
          },
        },
      ],
      filter: [],
    },
  }

  for (const [queryKey, osKey] of Object.entries(FIELD_MAPPING)) {
    if (queryKey == omitFilter) continue
    const terms = c.req.queries(queryKey)
    if (terms?.length) {
      // @ts-ignore
      dsl.bool.filter.push({
        terms: {
          [osKey]: terms,
        },
      })
    }
  }

  return dsl
}

export default app
