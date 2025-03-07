import { sql } from './db'

type Args = {
  myId: number
  ids: number[]
  isTrack: boolean
}

export async function mySaves({ myId, ids, isTrack }: Args) {
  const mySaves = await sql`
    select save_item_id
    from saves
    where user_id = ${myId}
      and save_item_id in ${sql(ids)}
      ${isTrack ? sql`and save_type = 'track'` : sql`and save_type != 'track'`}
      and is_delete = false
  `.values()
  return new Set(mySaves.flat()) as Set<number>
}
