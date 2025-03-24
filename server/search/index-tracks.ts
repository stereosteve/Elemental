import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js'
import { sql } from 'server/db/db'
import { client } from './opensearch-client'

export async function createIndex(name: string, drop: boolean) {
  if (drop) {
    await client.indices.delete({ index: name }, { ignore: [404] })
  }

  const textWithKeyword: Property = {
    type: 'text',
    fields: {
      keyword: {
        type: 'keyword',
        ignore_above: 256,
      },
    },
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
          bpm: {
            type: 'float',
          },
          title: textWithKeyword,
          genre: textWithKeyword,
          tags: textWithKeyword,
          releaseDate: {
            type: 'date',
            // format:
            //   'yyyy-MM-dd HH:mm:ss.SSSSSS||yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis',
          },
          musicalKey: {
            type: 'keyword',
          },

          streamConditions: {
            type: 'object',
            dynamic: 'true',
          },
          remixOf: {
            type: 'object',
            dynamic: 'true',
          },
          stemOf: {
            type: 'object',
            dynamic: 'true',
          },

          duration: {
            type: 'integer',
          },
          repostCount: {
            type: 'integer',
          },
          saveCount: {
            type: 'integer',
          },

          user: {
            dynamic: 'true',
            type: 'object',
          },
        },
      },
    },
  })
}

async function seedTracks() {
  const indexName = 'tracks'
  await createIndex(indexName, true)

  await sql`
  select
      'track' as "type",
      track_id as "id",
      title,
      coalesce(cover_art_sizes, cover_art) as img,
      genre,
      tags,
      mood,
      coalesce(release_date, tracks.created_at) as "releaseDate",
      duration,
      bpm,
      musical_key as "musicalKey",

      -- download_conditions,
      stream_conditions as "streamConditions",
      is_downloadable,
      download_conditions,
      remix_of as "remixOf",
      stem_of as "stemOf",


      -- stats
      aggt.repost_count as "repostCount",
      aggt.save_count as "saveCount",

      -- artist
      json_build_object(
        'handle', users.handle,
        'name', users.name,
        'location', users.location,
        'followerCount', aggu.follower_count
      ) as user

    from
      tracks
      join aggregate_track aggt using(track_id)
      join users on owner_id = user_id
      join aggregate_user aggu using (user_id)
    where is_unlisted = false
      and is_delete = false
      and tracks.is_available = true
      and stem_of is null

  `.cursor(10000, async (rows) => {
    await client.helpers.bulk({
      index: indexName,
      datasource: rows,
      onDocument(doc) {
        // console.log(doc)
        return { index: { _index: indexName, _id: doc!.id } }
      },
      onDrop(doc) {
        console.warn('failed to index', doc)
      },
    })
  })
}

await seedTracks()
await sql.end()
await client.close()

// 2025-01-29 15:44:31
