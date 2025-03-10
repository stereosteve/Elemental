import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { sql } from 'server/db/db'
import { mkdir } from 'node:fs/promises'
import zlib from 'node:zlib'

await mkdir('data', { recursive: true })

async function queryToFile(file: string, rawSql: any) {
  console.log('query', file)
  await pipeline(rawSql, zlib.createGzip(), createWriteStream(`data/${file}`))
}

await queryToFile(
  'tracks6.csv.gz',
  await sql`copy (
    select
      owner_id as user_id,
      track_id,
      title,
      coalesce(cover_art_sizes, cover_art) as img,
      aggt.repost_count,

      handle as user_handle,
      name as user_name
    from
      tracks
      join aggregate_track aggt using(track_id)
      join users on owner_id = user_id
      join aggregate_user aggu using (user_id)
    where follower_count > 5
      and is_unlisted = false
      and is_delete = false
      and stem_of is null
    order by users.user_id, track_id
  ) to stdout CSV HEADER`.readable()
)

/*
await queryToFile(
  'some_tracks.csv',
  await sql`copy (
    select
      owner_id as user_id,
      track_id,
      title,
      repost_count
    from
      tracks
      join aggregate_track using(track_id)
    where repost_count > 5
    order by user_id, track_id
  ) to stdout CSV HEADER`.readable()
)

await queryToFile(
  'some_users.csv',
  await sql`copy (
    select
      user_id,
      handle,
      name,
      coalesce(profile_picture_sizes, profile_picture) as img,
      coalesce(cover_photo_sizes, cover_photo) as "bannerImg",
      track_count as "trackCount",
      playlist_count as "playlistCount",
      album_count as "albumCount",
      repost_count as "repostCount",
      follower_count as "followerCount",
      following_count as "followingCount"
    from users
    join aggregate_user using (user_id)
    where user_id in (
      select owner_id
      from tracks
      join aggregate_track using(track_id)
      where repost_count > 5
    )
    order by user_id
  ) to stdout CSV HEADER`.readable()
)
*/

console.log('DONE')
await sql.end()
