import { Hono } from 'hono'
import { client } from './search/opensearch-client'

const app = new Hono()

app.get('/api/search', async (c) => {
  const from = parseInt(c.req.query('from') || '0')
  const q = c.req.query('q') || ''
  const found = await client.search({
    index: 'tracks',
    body: {
      query: {
        simple_query_string: {
          query: q + '*',
        },
      },
      size: 200,
      from: from,
      sort: ['artistName.keyword', 'title.keyword'],
      aggs: {
        top_genres: {
          terms: {
            field: 'genre.keyword',
            size: 10,
          },
        },
        top_artists: {
          terms: {
            field: 'artistHandle.keyword',
            size: 10,
          },
          // aggs: {
          //   top_names: {
          //     terms: {
          //       field: 'artistName.keyword',
          //       size: 10,
          //     },
          //   },
          // },
        },
        musicalKey: {
          terms: {
            field: 'musical_key',
            size: 10,
          },
        },
        bpm: {
          terms: {
            field: 'bpm',
            size: 10,
          },
        },
      },
    },
  })
  return c.json(found)
})

app.post('/', (c) => c.json('create an author', 201))
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app
