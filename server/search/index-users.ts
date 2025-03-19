import { sql } from 'server/db/db'
import { client } from './opensearch-client'

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
        properties: {},
      },
    },
  })
}

async function indexUsers() {
  const indexName = 'users'
  await createIndex(indexName, true)

  await sql`
    select
      'user' as "type",
      user_id as id,
      name,
      handle,
      bio,
      location,
      coalesce(profile_picture_sizes, profile_picture) as img,
      coalesce(cover_photo_sizes, cover_photo) as "bannerImg",
      users.created_at as "createdAt",

      track_count as "trackCount",
      playlist_count as "playlistCount",
      album_count as "albumCount",
      repost_count as "repostCount",
      follower_count as "followerCount",
      following_count as "followingCount"
    from users
    join aggregate_user using (user_id)
    limit 10000

  `.cursor(10000, async (rows) => {
    await client.helpers.bulk({
      index: indexName,
      datasource: rows,
      onDocument(doc) {
        console.log(doc)
        return { index: { _index: indexName, _id: `track:${doc!.id}` } }
      },
      onDrop(doc) {
        console.warn('failed to index', doc)
      },
    })
  })
}

await indexUsers()
await sql.end()
await client.close()

// 2025-01-29 15:44:31
