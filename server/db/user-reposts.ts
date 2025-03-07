import { FeedStub } from '@/types/feed-stub'
import { sql } from './db'
import { populateStubs } from './populate-stubs'

type Args = {
  userId: number
  myId?: number
}

export async function userReposts({ userId, myId }: Args) {
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
  return await populateStubs({ stubs, myId })
}
