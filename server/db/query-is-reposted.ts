import { sql } from './db'

type Args = {
  myId: number
  ids: number[]
  isTrack: boolean
}

export async function queryIsReposted({ myId, ids, isTrack }: Args) {
  const myReposts = await sql`
    select repost_item_id
    from reposts
    where user_id = ${myId}
      and repost_item_id in ${sql(ids)}
      ${
        isTrack
          ? sql`and repost_type = 'track'`
          : sql`and repost_type != 'track'`
      }
      and is_delete = false
  `.values()
  return new Set(myReposts.flat()) as Set<number>
}
