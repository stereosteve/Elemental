import { keyBy } from '@/lib/keyBy'
import { sql } from './db'
import { queryUsers } from './query-users'

type Args = {
  userId: number
  myId: number
}

export async function queryMutuals({ userId, myId }: Args) {
  const rows = await sql`
    select follower_user_id
    from follows
    where is_delete = false
      and followee_user_id = ${userId}
      and follower_user_id in (
        select followee_user_id
        from follows
        where follower_user_id = ${myId}
          and is_delete = false
      )
    order by created_at desc
    limit 20
  `.values()

  const mutualIds: number[] = rows.flat()
  const users = await queryUsers({ ids: mutualIds })
  const usersById = keyBy(users, 'id')
  return mutualIds.map((id) => usersById[id]).filter(Boolean)
}
