import { FeedStub } from '@/types/feed-stub'
import { sql } from './db'
import { populateStubs } from './populate-stubs'

type Args = {
  userId: number
  myId?: number
  before?: string
}

export async function userLibrary({ userId, myId, before }: Args) {
  before = before || 'NOW()'
  // might want to make this dynamic
  const interval = sql.unsafe(`INTERVAL '90 DAYS'`)

  let stubs: FeedStub[] = await sql`
  with actions as (
    (
      select
        user_id as actor_id,
        'save' as verb,
        save_type::text as obj_type,
        save_item_id as obj_id,
        created_at
      from saves
      where user_id = ${userId}
        and is_delete = false
        and created_at < ${before}
        and created_at >= ${before}::timestamp - ${interval}
      order by created_at desc
    )


    UNION ALL

    (
      select
        user_id as actor_id,
        'repost' as verb,
        repost_type::text as obj_type,
        repost_item_id as obj_id,
        created_at
      from reposts
      where user_id = ${userId}
        and is_delete = false
        and created_at < ${before}
        and created_at >= ${before}::timestamp - ${interval}
      order by created_at desc
    )
  )
  select * from actions order by created_at desc
  `

  /*

  */

  // we union both saves and reposts (so as to show both in library)
  // but we don't want duplicate rows for both save + repost... so unique it
  const seen = new Set()
  stubs = stubs.filter((stub) => {
    const k = `${stub.obj_type}:${stub.obj_id}`
    const ok = !seen.has(k)
    seen.add(k)
    return ok
  })

  return await populateStubs({ stubs, myId })
}
