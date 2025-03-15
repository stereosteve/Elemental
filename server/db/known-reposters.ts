// known reposters...

import { keyBy } from '@/lib/keyBy'
import { queryUsers } from './query-users'
import { UserRow } from '@/types/user-row'
import { sql } from './db'

type Args = {
  myId: number
  isTrack: boolean
  ids: number[]
}

export async function knownRepostersBulk({ myId, isTrack, ids }: Args) {
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
      AND ${isTrack ? sql`repost_type = 'track'` : sql`repost_type != 'track'`}
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

  const userIds = rows.flatMap((r) => r.userIds)

  // todo: should we pass myId here?  seems kinda silly, but might need it for a popover card
  const users = await queryUsers({ ids: userIds })

  const usersById = keyBy(users, 'id')
  const byTrackId: Record<number, UserRow[]> = {}
  for (const row of rows) {
    byTrackId[row.trackId] = row.userIds
      .map((id: number) => usersById[id])
      .filter(Boolean)
  }

  return byTrackId
}
