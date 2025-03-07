import { FeedStub } from '@/types/feed-stub'
import { sql } from './db'
import { populateStubs } from './populate-stubs'

export async function feed(myId: number, before?: string) {
  before = before || 'NOW()'

  // could make this dynamic based on user follower count...
  // the more people you follow, the shorter we should make this?
  const interval = sql.unsafe(`INTERVAL '30 DAYS'`)

  let stubs: FeedStub[] = await sql`
    with
    follow_set as (
      select followee_user_id as user_id from follows
      where follower_user_id = ${myId}
        and is_delete = false
    ),
    history as (

      (
        select
          user_id as actor_id,
          'repost' as verb,
          repost_type as obj_type,
          repost_item_id as obj_id,
          created_at
        from reposts
        join follow_set using (user_id)
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
          and is_delete = false
      )

      UNION ALL

      (
        select
          user_id as actor_id,
          'post' as verb,
          'track' as obj_type,
          track_id as obj_id,
          created_at
        from tracks
        join follow_set on owner_id = user_id
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
          and is_unlisted = false
          and is_delete = false
          and stem_of is null
      )

      UNION ALL

      (
        select
          user_id as actor_id,
          'post' as verb,
          'playlist' as obj_type,
          playlist_id as obj_id,
          created_at
        from playlists
        join follow_set on playlist_owner_id = user_id
        where created_at < ${before}
          and created_at >= ${before}::timestamp - ${interval}
          and is_delete = false
          AND is_private = false
      )

    )
    select * from history
    order by created_at asc
  `

  // remove duplicates
  // todo: remove tracks that appear in playlist...
  const seen = new Set()
  stubs = stubs.filter((stub) => {
    const k = `${stub.obj_type}:${stub.obj_id}`
    const ok = !seen.has(k)
    seen.add(k)
    return ok
  })

  stubs.reverse()

  // we fetch 30 days above...
  // which is good for removing duplicates
  // but if the feed is super huge and slow,
  // we can apply a limit here before populateStubs
  // to make load time bit better
  stubs = stubs.slice(0, 50)

  return await populateStubs({ stubs, myId })
}
