import { PlaylistRow } from '@/types/playlist-row'
import { sql } from './db'
import { queryTracks } from './query-tracks'
import { keyBy } from '@/lib/keyBy'
import { queryIsReposted } from './query-is-reposted'
import { queryIsSaved } from './query-is-saved'

type PlaylistQuery = {
  ids?: number[]
  userId?: number
  myId?: number
}

export async function queryPlaylists({ ids, userId, myId }: PlaylistQuery) {
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
  {
    const trackIds = playlists.flatMap((p) =>
      p.playlist_contents.track_ids.map((t) => t.track)
    )
    const tracks = await queryTracks({ ids: trackIds })
    const tracksById = keyBy(tracks, 'id')

    for (const playlist of playlists) {
      playlist.tracks = playlist.playlist_contents.track_ids
        .map((t) => tracksById[t.track])
        .filter(Boolean)
    }
  }

  // personalize
  if (myId) {
    // todo: known reposters
    const ids = playlists.map((p) => p.id)

    const [saveSet, repostSet] = await Promise.all([
      queryIsSaved({ myId, ids, isTrack: false }),
      queryIsReposted({ myId, ids, isTrack: false }),
    ])

    for (const playlist of playlists) {
      playlist.isReposted = repostSet.has(playlist.id)
      playlist.isSaved = saveSet.has(playlist.id)
    }
  }

  // debug timing...
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
