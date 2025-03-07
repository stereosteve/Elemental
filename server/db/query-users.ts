import { UserRow } from '@/types/user-row'
import { sql } from './db'
import { keyBy } from '@/lib/keyBy'

type UserQuery = {
  q?: string
  handle?: string
  ids?: number[] | string[]
  limit?: string
  myId?: number
}

export async function queryUsers({ handle, ids, q, limit, myId }: UserQuery) {
  const users: UserRow[] = await sql`
  select
    'user' as "type",
    user_id as id,
    name,
    handle,
    coalesce(profile_picture_sizes, profile_picture) as img,
    coalesce(cover_photo_sizes, cover_photo) as "bannerImg",
    users.created_at as "createdAt",

    track_count as "trackCount",
    playlist_count as "playlistCount",
    album_count as "albumCount",
    repost_count as "repostCount",
    follower_count as "followerCount",
    following_count as "followingCount"

    -- false as "isFollower"
    -- false as "isFollowed"

  from users
  join aggregate_user using (user_id)
  where
    1=1
    ${ids ? sql`AND user_id in ${sql(ids)}` : sql``}
    ${handle ? sql`AND handle_lc = ${handle.toLowerCase()}` : sql``}
    ${q ? sql`AND handle_lc like ${q.toLowerCase()} || '%'` : sql``}
  order by follower_count desc
  ${limit ? sql`LIMIT ${limit}` : sql``}
  ;
  `

  // personalize
  if (myId) {
    const usersById = keyBy(users, 'id')
    const userIds = Object.keys(usersById)
    const [followers, followed] = await Promise.all([
      sql`
        select follower_user_id from follows
        where is_delete = false
          and followee_user_id = ${myId}
          and follower_user_id in ${sql(userIds)}
        `.values(),
      sql`
        select followee_user_id from follows
        where is_delete = false
          and follower_user_id = ${myId}
          and followee_user_id in ${sql(userIds)}
        `.values(),
    ])

    followers.flat().map((id) => (usersById[id].isFollower = true))
    followed.flat().map((id) => (usersById[id].isFollowed = true))
  }

  return users
}
