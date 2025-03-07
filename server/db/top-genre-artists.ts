import { keyBy } from '@/lib/keyBy'
import { UserRow } from '@/types/user-row'
import { sql } from './db'
import { queryUsers } from './query-users'

export async function genreArtists() {
  const rows = await sql`
  with genre_users as (
    SELECT
      user_id,
      dominant_genre,
      follower_count,
      ROW_NUMBER() OVER (PARTITION BY dominant_genre ORDER BY follower_count DESC) AS row_index
    FROM aggregate_user
    JOIN users using (user_id)
    WHERE
      dominant_genre is not null
      AND dominant_genre != ''
      AND dominant_genre_count > 3
      AND follower_count > 1000
      AND is_available = true
  ),
  ranked_genres as (
    select
      dominant_genre as genre,
      array_agg(user_id) as genre_users,
      sum(follower_count) as genre_followers
    from genre_users
    where row_index < 20
    group by 1
    order by genre_followers desc
  )
  select * from ranked_genres
  order by genre_followers desc
  `

  const userIds = rows.flatMap((r) => r.genre_users)
  const users = await queryUsers({ ids: userIds })
  const usersById = keyBy(users, 'id')
  return rows.map((row) => ({
    genre: row.genre as string,
    users: row.genre_users.map((id: number) => usersById[id]) as UserRow[],
  }))
}
