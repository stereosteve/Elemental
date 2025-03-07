import { CidImage } from '@/components/cid-image'
import { PageTitle } from '@/components/page-title'
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
      <PageTitle title={`${user.handle}`} />
      <img
        loading="lazy"
        decoding="async"
        key={user.bannerImg}
        className="h-64 w-full object-cover"
        src={`https://creatornode2.audius.co/content/${user.bannerImg}/2000x.jpg`}
      />
      <div className="flex gap-4 p-2">
        <CidImage img={user.img} className="ml-4 mt-[-40px]" size={140} />
        <div className="flex-1">
          <div className="text-xl font-black">{user.name}</div>
          <div className="flex gap-2 p-2">
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

            <div className="flex-1"></div>
            <button onClick={() => become(user.id)}>become</button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <Outlet />
      </div>
    </div>
  )
}

export default UserLayout
