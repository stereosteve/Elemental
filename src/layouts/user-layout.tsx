import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { NavLink, Outlet, useParams } from 'react-router'

type UserResp = {
  user: UserRow
}

export function UserLayout() {
  const { become } = useMe()
  const { handle } = useParams()
  const { data } = useQuery<UserResp>({
    queryKey: [`/api/users/${handle}`],
  })
  if (!data) return null
  const { user } = data

  return (
    <div className="user-layout">
      <div className="text-xl bg-blue-100 p-2">{user.name}</div>
      <div className="flex gap-2">
        {user.trackCount > 0 && (
          <NavLink to={`/${user.handle}`} end>
            Tracks
          </NavLink>
        )}
        {(user.playlistCount > 0 || user.albumCount > 0) && (
          <NavLink to={`/${user.handle}/playlists`}>Playlists</NavLink>
        )}
        {user.repostCount > 0 && (
          <NavLink to={`/${user.handle}/reposts`}>Reposts</NavLink>
        )}
        <NavLink to={`/${user.handle}/comments`}>Comments</NavLink>

        <button onClick={() => become(user.id)}>become</button>
      </div>

      <div className="p-8">
        <Outlet />
      </div>
    </div>
  )
}

export default UserLayout
