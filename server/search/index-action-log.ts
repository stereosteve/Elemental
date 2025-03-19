// import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js'
import { sql } from 'server/db/db'
import { client } from './opensearch-client'
import postgres from 'postgres'

const indexName = 'action_log'

export type ActionRow = {
  id: string
  timestamp: Date
  actorId: string
  verb: string
  objType: string
  objId: number
  isDelete: boolean
}

async function indexActions(rows: postgres.Row[]) {
  await client.helpers.bulk({
    index: indexName,
    datasource: rows,
    onDocument(doc) {
      ;[doc.actorId, doc.verb, doc.objType, doc.objId].forEach((v) => {
        if (!v) throw new Error('invalid action doc ' + JSON.stringify(doc))
      })
      doc.id = [doc.actorId, doc.verb, doc.objType, doc.objId].join(':')
      console.log(doc.id)
      return { index: { _index: indexName, _id: doc.id } }
    },
    onDrop(doc) {
      console.warn('failed to index', doc)
    },
  })
}

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
        dynamic: 'false',
        properties: {
          actorId: { type: 'keyword' },
          verb: { type: 'keyword' },
          objType: { type: 'keyword' },
          objId: { type: 'keyword' },
          // objOwnerId ??
          timestamp: {
            type: 'date',
          },
        },
      },
    },
  })
}

async function indexFollows() {
  await sql`
    select
      created_at as "timestamp",
      follower_user_id as "actorId",
      'follow' as "verb",
      'user' as "objType",
      followee_user_id as "objId",
      is_delete
    from
      follows
  `.cursor(1_000_000, indexActions)
}

async function indexReposts() {
  await sql`
    select
      created_at as "timestamp",
      user_id as "actorId",
      'repost' as "verb",
      repost_type as "objType",
      repost_item_id as "objId",
      is_delete
    from
      reposts
  `.cursor(100_000, indexActions)
}

await createIndex(indexName, true)

await indexFollows()
await indexReposts()

// await Promise.all([])

await sql.end()
await client.close()

// 2025-01-29 15:44:31
