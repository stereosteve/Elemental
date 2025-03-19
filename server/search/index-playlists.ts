import { sql } from 'server/db/db'
import { client } from './opensearch-client'
import { queryPlaylists } from 'server/db/query-playlists'

export async function createIndex(name: string, drop: boolean) {
  if (drop) {
    await client.indices.delete({ index: name }, { ignore: [404] })
  }

  await client.indices.create({
    index: name,
    body: {
      settings: {
        index: {
          number_of_shards: 1,
          number_of_replicas: 0,
          refresh_interval: '3s',
        },
      },
      mappings: {
        dynamic: 'true',
        properties: {
          playlistContents: {
            type: 'object',
            dynamic: 'false',
          },
          tracks: {
            type: 'object',
            dynamic: 'false',
          },
        },
      },
    },
  })
}

async function indexPlaylists() {
  const indexName = 'playlists'
  await createIndex(indexName, true)

  const rows = await queryPlaylists({ limit: 100 })

  await client.helpers.bulk({
    index: indexName,
    datasource: rows,
    onDocument(doc) {
      console.log(doc)
      return { index: { _index: indexName, _id: doc!.id } }
    },
    onDrop(doc) {
      console.warn('failed to index', doc)
    },
  })
}

await indexPlaylists()
await sql.end()
await client.close()

// 2025-01-29 15:44:31
