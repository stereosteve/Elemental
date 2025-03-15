import { FeedStub } from '@/types/feed-stub'
import { sql } from './db'
import { populateStubs } from './populate-stubs'

type Args = {
  userId: number
  myId?: number
  before?: string
}

export async function queryPlayHistory({ userId, before, myId }: Args) {
  before = before || 'NOW()'
  let stubs: FeedStub[] = await sql`
    select
      'play' as verb,
      'track' as obj_type,
      play_item_id as obj_id,
      created_at
    from plays
    where user_id is not null and user_id = ${userId}
      and created_at < ${before}
    order by created_at desc
    limit 100
  `

  // play history has duplicates...
  // remove entries if same track ID + timestamp
  const seen = new Set()
  stubs = stubs.filter((stub) => {
    const k = `${stub.objId}:${stub.createdAt}`
    const ok = !seen.has(k)
    seen.add(k)
    return ok
  })

  return populateStubs({ stubs, myId })
}
