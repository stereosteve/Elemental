import { Context, Hono } from 'hono'
import { client } from './search/opensearch-client'
import { QueryContainer } from '@opensearch-project/opensearch/api/_types/_common.query_dsl.js'

const app = new Hono()

app.get('/api/search', async (c) => {
  const from = parseInt(c.req.query('from') || '0')

  // const dsl = buildQueryContainer(c)
  // return c.json(dsl)

  const found = await client.search({
    index: 'tracks',
    body: {
      query: buildQueryContainer(c),
      size: 200,
      from: from,
      sort: ['artistName.keyword', 'title.keyword'],
    },
  })
  return c.json(found)
})

const FIELD_MAPPING: Record<string, string> = {
  genre: 'genre.keyword',
  artist: 'artistName.keyword',
  musical_key: 'musical_key',
}

app.get('/api/search/facet', async (c) => {
  const fields = Object.keys(FIELD_MAPPING)
  const facets = await Promise.all(fields.map((f) => facetField(c, f)))
  const keyedFacets = Object.fromEntries(fields.map((f, i) => [f, facets[i]]))
  return c.json(keyedFacets)
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
            size: 10,
          },
        },
      },
    },
  })

  // return found
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
            query: c.req.query('q') || '' + '*',
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
      dsl!.bool!.filter.push({
        terms: {
          [osKey]: terms,
        },
      })
    }
  }

  return dsl
}

export default app
