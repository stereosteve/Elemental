import { UserRow } from '@/types/user-row'
import { sql } from './db'
import { z } from 'zod'

export const UserQueryParser = z.object({
  handle: z.string().optional(),
  ids: z.array(z.number()).optional(),
  myId: z.coerce.number().optional(),

  limit: z.coerce.number().optional(),
})

export type UserQueryParser = z.infer<typeof UserQueryParser>

export async function queryUsers({
  handle,
  ids,
  myId,
  limit,
}: UserQueryParser) {
  if (ids?.length && ids[0] == undefined) {
    throw new Error(`bad id`)
  }

  const users: UserRow[] = await sql`
  select
    'user' as "type",
    user_id as id,
    name,
    handle,
    bio,
    location,
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
  order by follower_count desc
  ${limit ? sql`LIMIT ${limit}` : sql``}
  ;
  `

  // personalize
  if (myId) {
    const userIds = users.map((u) => u.id)
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

    const followerSet = new Set(followers.flat())
    const followedSet = new Set(followed.flat())

    for (const user of users) {
      user.isFollower = followerSet.has(user.id)
      user.isFollowed = followedSet.has(user.id)
    }
  }

  return users
}
