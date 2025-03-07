import { TrackRow } from '@/types/track-row'
import { sql } from './db'
import { knownRepostersBulk } from './known-reposters'
import { mySaves } from './my-saves'
import { myReposts } from './my-reposts'

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
    const ids = tracks.map((t) => t.id)

    const [saveSet, repostSet, known] = await Promise.all([
      mySaves({ myId, ids, isTrack: true }),
      myReposts({ myId, ids, isTrack: true }),
      knownRepostersBulk({
        myId,
        type: 'track',
        ids: ids,
      }),
    ])

    for (const track of tracks) {
      track.knownReposters = known[track.id]
      track.isReposted = repostSet.has(track.id)
      track.isSaved = saveSet.has(track.id)
    }
  }

  return tracks
}
