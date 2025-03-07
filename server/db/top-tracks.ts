import { keyBy } from '@/lib/keyBy'
import { sql } from './db'
import { queryTracks } from './query-tracks'

type Args = {
  myId?: number
}

export async function fauxTrending({ myId }: Args) {
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

  const tracks = await queryTracks({ ids: rows.map((r) => r.id), myId })
  const tracksById = keyBy(tracks, 'id')
  return rows.map((r) => tracksById[r.id])
}
