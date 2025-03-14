// import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js'
import { sql } from 'server/db/db'
import { client } from './opensearch-client'

export async function createIndex(name: string, drop: boolean) {
  if (drop) {
    await client.indices.delete({ index: name }, { ignore: [404] })
  }

  // const textWithKeyword: Property = {
  //   type: 'text',
  //   fields: {
  //     keyword: {
  //       type: 'keyword',
  //       ignore_above: 256,
  //     },
  //   },
  // }

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
      },
    },
  })
}

async function seedActionLog() {
  console.log('____________ SEED ACTION LOG ______________ ')
  const indexName = 'action_log'
  await createIndex(indexName, true)

  const rows = await sql`
  select
    created_at as "timestamp",
    'follow' as "verb",
    'user' as "target",
    follower_user_id as actor_id,
    followee_user_id as target_id,
    is_delete
  from
    follows
  limit 1000
  `

  await client.helpers.bulk({
    index: indexName,
    datasource: rows,
    onDocument(doc) {
      doc.id = [doc.actor_id, doc.verb, doc.target, doc.target_id].join(':')
      doc.created_at = doc.timestamp.substring(0, 19)
      // console.log(doc)
      return { index: { _index: indexName, _id: doc.id } }
    },
    onDrop(doc) {
      console.warn('failed to index', doc)
    },
  })
}

await seedActionLog()
await sql.end()
await client.close()

// 2025-01-29 15:44:31
