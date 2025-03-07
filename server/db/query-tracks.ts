import { TrackRow } from '@/types/track-row'
import { sql } from './db'
import { knownRepostersBulk } from './known-reposters'

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

  // personalize
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

    // isSaved
    // isReposted
  }

  return tracks
}
