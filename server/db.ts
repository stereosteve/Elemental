import 'dotenv/config'
import postgres from 'postgres'
import { keyBy } from '@/lib/keyBy'
import type { FeedStub } from '@/types/feed-stub'
import type { PlaylistRow } from '@/types/playlist-row'
import type { TrackRow } from '@/types/track-row'
import type { UserRow } from '@/types/user-row'

export const sql = postgres(process.env.discoveryDbUrl || '', {
  prepare: false,
  types: {
    // many columns are timestamp without time zone
    // which is bad because if developer machine has a timezone set
    // dates will be interpreted to be in the local timezone...
    // which can mess up cursor pagination stuff
    // so here we tell postgres-js not to parse as date
    // and just pass the string value thru directly...
    skipParseDate: {
      to: 1114,
      from: [1114],
      serialize: (v: string) => v,
      parse: (v: string) => v,
    },
  },
})

//
// USER
//
type UserQuery = {
  handle?: string
  ids?: number[] | string[]
}

export async function queryUsers({ handle, ids }: UserQuery) {
  const users: UserRow[] = await sql`
  select
    'user' as "type",
    user_id as id,
    name,
    handle,
    coalesce(profile_picture_sizes, profile_picture) as img,
    coalesce(cover_photo_sizes, cover_photo) as "bannerImg",
    users.created_at as "createdAt",

    track_count as "trackCount",
    follower_count as "followerCount",
    following_count as "followingCount"

  from users
  join aggregate_user using (user_id)
  where
    1=1
    ${ids ? sql`AND user_id in ${sql(ids)}` : sql``}
    ${handle ? sql`AND handle_lc = ${handle.toLowerCase()}` : sql``}
  order by follower_count desc
  ;
  `
  return users
}

// known reposters...

export async function knownReposters(myId: number, type: string, id: number) {
  const ids = await sql`
    select user_id
    from reposts
    join aggregate_user using (user_id)
    where
      user_id in (
        select followee_user_id
        from follows
        where follower_user_id = ${myId}
          and is_delete = false
      )
      AND repost_type = ${type}
      AND repost_item_id = ${id}
    order by follower_count desc
    limit 10
  `.values()

  // return ids.flat()
  return queryUsers({ ids: ids.flat() })
}

export async function knownRepostersBulk({
  myId,
  type,
  ids,
}: {
  myId: number
  type: string
  ids: number[]
}) {
  const rows = await sql`
    with top_reposters as (
      select
        repost_item_id as track_id,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY repost_item_id ORDER BY created_at DESC) AS row_index
      from reposts
      where
      user_id in (
        select followee_user_id
        from follows
        where follower_user_id = ${myId}
          and is_delete = false
      )
      AND repost_type = ${type}
      AND repost_item_id in ${sql(ids)}
      AND is_delete = false
    )
    select
      track_id,
      array_agg(user_id) as user_ids
    from top_reposters
    where row_index < 10
    group by 1
  `

  const userIds = rows.flatMap((r) => r.user_ids)
  const users = await queryUsers({ ids: userIds })
  const usersById = keyBy(users, 'id')
  const byTrackId: Record<number, UserRow[]> = {}
  for (const row of rows) {
    byTrackId[row.track_id] = row.user_ids
      .map((id: number) => usersById[id])
      .filter(Boolean)
  }

  return byTrackId
}

//
// TRACK
//

type TracksQuery = {
  myId?: number
  ids?: number[]
  userId?: number
}

export async function queryTracks({ myId, ids, userId }: TracksQuery) {
  const tracks: TrackRow[] = await sql`
  select
    'track' as "type",
    track_id as id,
    title,
    coalesce(cover_art_sizes, cover_art) as img,
    tracks.created_at as "createdAt",

    repost_count as "repostCount",
    save_count as "saveCount",
    comment_count as "commentCount",

    json_build_object(
      'id', u.user_id,
      'handle', u.handle,
      'name', u.name
    ) as user

  from tracks
  join users u on owner_id = user_id
  join aggregate_track using (track_id)
  where
    1=1
    -- todo: expose in query with defaults
    and is_unlisted = false
    and is_delete = false
    and stem_of is null
    ${userId ? sql`AND owner_id = ${userId}` : sql``}
    ${ids ? sql`AND track_id in ${sql(ids)}` : sql``}
  order by tracks.created_at desc
  ;
  `

  if (myId) {
    const trackIds = tracks.map((t) => t.id)
    const known = await knownRepostersBulk({
      myId,
      type: 'track',
      ids: trackIds,
    })
    for (const track of tracks) {
      track.knownReposters = known[track.id]
    }
  }

  return tracks
}

//
// PLAYLIST
//

type PlaylistQuery = {
  ids?: number[]
  userId?: number
}

export async function queryPlaylists({ ids, userId }: PlaylistQuery) {
  const startTime = performance.now()
  const playlists: PlaylistRow[] = await sql`
  select
    'playlist' as "type",
    playlist_id as id,
    playlist_name as name,
    playlist_contents,
    playlists.created_at as "createdAt",
    coalesce(playlist_image_sizes_multihash, playlist_image_multihash) as img,

    json_build_object(
      'id', u.user_id,
      'handle', u.handle,
      'name', u.name
    ) as user
  from playlists
  join users u on playlist_owner_id = user_id
  where
    is_delete = false
    AND is_private = false
    ${userId ? sql`AND playlist_owner_id = ${userId}` : sql``}
    ${ids ? sql`AND playlist_id in ${sql(ids)}` : sql``}
  order by playlists.created_at desc
  `

  // attach tracks
  const trackIds = playlists.flatMap((p) =>
    p.playlist_contents.track_ids.map((t) => t.track)
  )
  const tracks = await queryTracks({
    ids: trackIds,
  })
  const tracksById: Record<number, TrackRow> = {}
  for (const track of tracks) {
    tracksById[track.id] = track
  }

  for (const playlist of playlists) {
    playlist.tracks = playlist.playlist_contents.track_ids
      .map((t) => tracksById[t.track])
      .filter(Boolean)
  }

  if (ids?.length) {
    const trackCount = playlists.reduce((acc, p) => acc + p.tracks.length, 0)
    console.log(
      `playlist load`,
      ids.length,
      trackCount,
      performance.now() - startTime
    )
  }

  return playlists.filter((p) => p.tracks.length)
}

//
// COMMENTS
//

type CommentsQuery = {
  userId?: number
  trackId?: number
}

export async function queryComments({ userId, trackId }: CommentsQuery) {
  const limit = 100
  const stubs: FeedStub[] = await sql`
    select
      user_id as actor_id,
      'comment' as verb,
      lower(entity_type) as obj_type,
      entity_id as obj_id,
      "text",
      created_at
    from comments
    where
      is_delete = false
      ${userId ? sql`AND user_id = ${userId}` : sql``}
      ${trackId ? sql`AND entity_id = ${trackId}` : sql``}
    order by created_at desc
    limit ${limit}
  `

  return await populateStubs(stubs)
}

//
// GENRE STUFF
//

export async function genreArtists() {
  const rows = await sql`
  with genre_users as (
    SELECT
      user_id,
      dominant_genre,
      follower_count,
      ROW_NUMBER() OVER (PARTITION BY dominant_genre ORDER BY follower_count DESC) AS row_index
    FROM aggregate_user
    WHERE
      dominant_genre is not null
      AND dominant_genre != ''
      AND dominant_genre_count > 3
      AND follower_count > 10
  ),
  ranked_genres as (
    select
      dominant_genre as genre,
      array_agg(user_id) as genre_users,
      sum(follower_count) as genre_followers
    from genre_users
    where row_index < 20
    group by 1
    order by genre_followers desc
  )
  select * from ranked_genres
  `

  const userIds = rows.flatMap((r) => r.genre_users)
  const users = await queryUsers({ ids: userIds })
  const usersById = keyBy(users, 'id')
  return rows.map((row) => ({
    genre: row.genre as string,
    users: row.genre_users.map((id: number) => usersById[id]) as UserRow[],
  }))
}

//
// FEED STUFF
//

export async function feed(myId: number, before?: string) {
  before = before || 'NOW()'

  // could make this dynamic based on user follower count...
  // the more people you follow, the shorter we should make this?
  const interval = sql.unsafe(`INTERVAL '30 DAYS'`)

  let stubs: FeedStub[] = await sql`
    with
    follow_set as (
      select followee_user_id as user_id from follows
      where follower_user_id = ${myId}
    ),
    history as (

      (
        select
          user_id as actor_id,
          'repost' as verb,
          repost_type as obj_type,
          repost_item_id as obj_id,
          created_at
        from reposts
        join follow_set using (user_id)
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
      )

      UNION ALL

      (
        select
          user_id as actor_id,
          'post' as verb,
          'track' as obj_type,
          track_id as obj_id,
          created_at
        from tracks
        join follow_set on owner_id = user_id
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
      )

      UNION ALL

      (
        select
          user_id as actor_id,
          'post' as verb,
          'playlist' as obj_type,
          playlist_id as obj_id,
          created_at
        from playlists
        join follow_set on playlist_owner_id = user_id
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
      )

    )
    select * from history
    order by created_at asc
  `

  // remove duplicates
  const seen = new Set()
  stubs = stubs.filter((stub) => {
    const k = `${stub.obj_type}:${stub.obj_id}`
    const ok = !seen.has(k)
    seen.add(k)
    return ok
  })

  stubs.reverse()

  // we fetch 30 days above...
  // which is good for removing duplicates
  // but if the feed is super huge and slow,
  // we can apply a limit here before populateStubs
  // to make load time bit better
  stubs = stubs.slice(0, 50)

  return await populateStubs(stubs, myId)
}

export async function userReposts(userId: number) {
  const limit = 100
  const stubs: FeedStub[] = await sql`
    select
      user_id as actor_id,
      'repost' as verb,
      repost_type as obj_type,
      repost_item_id as obj_id,
      created_at
    from reposts
    where user_id = ${userId}
    order by created_at desc
    limit ${limit}
  `

  return await populateStubs(stubs)
}

//
// FAUX-TRENDING
//

export async function fauxTrending() {
  const rows = await sql`
    select
      repost_item_id as id,
      sum(follower_count)
    from reposts
    join aggregate_user using (user_id)
    where repost_type = 'track'
    and created_at > NOW() - INTERVAL '30 days'
    group by 1
    order by 2 desc
    limit 100
  `

  const tracks = await queryTracks({ ids: rows.map((r) => r.id) })
  const tracksById = keyBy(tracks, 'id')
  return rows.map((r) => tracksById[r.id])
}

async function populateStubs(stubs: FeedStub[], myId?: number) {
  // fill stubs

  const actorIds = stubs.map((s) => s.actor_id)

  const trackIds = stubs
    .filter((s) => s.obj_type == 'track')
    .map((s) => s.obj_id)

  const playlistIds = stubs
    .filter((s) => s.obj_type != 'track')
    .map((s) => s.obj_id)

  const [actors, tracks, playlists] = await Promise.all([
    queryUsers({ ids: actorIds }),
    queryTracks({ ids: trackIds, myId }),
    queryPlaylists({ ids: playlistIds }),
  ])

  for (const stub of stubs) {
    stub.actor = actors.find((a) => a.id == stub.actor_id)
    if (stub.obj_type == 'track') {
      stub.track = tracks.find((t) => t.id == stub.obj_id)
    } else {
      stub.playlist = playlists.find((p) => p.id == stub.obj_id)
    }
  }

  return stubs.filter((s) => s.track || s.playlist)
}
