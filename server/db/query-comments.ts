//
// COMMENTS
//

import { FeedStub } from '@/types/feed-stub'
import { sql } from './db'
import { populateStubs } from './populate-stubs'

type CommentsQuery = {
  userId?: number
  trackId?: number
}

export async function queryComments({ userId, trackId }: CommentsQuery) {
  const limit = 100
  const stubs: FeedStub[] = await sql`
    select
      user_id as actor_id,
      'comment' as verb,
      lower(entity_type) as obj_type,
      entity_id as obj_id,
      "text",
      created_at
    from comments
    where
      is_delete = false
      ${userId ? sql`AND user_id = ${userId}` : sql``}
      ${trackId ? sql`AND entity_id = ${trackId}` : sql``}
    order by created_at desc
    limit ${limit}
  `

  return await populateStubs({ stubs })
}
