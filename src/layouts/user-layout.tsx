import { CidImage } from '@/components/cid-image'
import { FollowButton } from '@/components/follow-button'
import { Mutuals } from '@/components/mutuals'
import { PageTitle } from '@/components/page-title'
import { Stat } from '@/components/stat'
import { Button } from '@/components/ui/button'
import { urlFor } from '@/lib/urlFor'
import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { DramaIcon } from 'lucide-react'
import { NavLink, Outlet, useParams } from 'react-router'

type UserResp = {
  user: UserRow
}

export function UserLayout() {
  const { myHandle, become } = useMe()
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
        {user.handle == myHandle ? (
          <Button className="absolute top-4 right-4" onClick={() => become()}>
            logout
          </Button>
        ) : (
          <Button
            className="absolute top-4 right-4"
            onClick={() => become(user.handle)}
          >
            <DramaIcon />
          </Button>
        )}
        <CidImage img={user.img} className="ml-2 mt-[-40px]" size={140} />
        <div className="flex-1">
          <div className="text-xl font-black">{user.name}</div>
          <div className="flex gap-2 p-2 user-nav">
            <NavLink to={urlFor.user(user)} end>
              {user.trackCount > 0 ? 'Tracks' : 'Reposts'}
            </NavLink>
            {(user.playlistCount > 0 || user.albumCount > 0) && (
              <NavLink to={`/${user.handle}/playlists`}>Playlists</NavLink>
            )}
            {user.trackCount > 0 && user.repostCount > 0 && (
              <NavLink to={`/${user.handle}/reposts`}>Reposts</NavLink>
            )}
            <NavLink to={`/${user.handle}/comments`}>Comments</NavLink>

            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mx-4 max-w-[1200px]">
        <div className="flex-grow">
          <Outlet />
        </div>

        <div className="p-8 max-w-[300px]">
          <p className="text-sm mb-4">{user.bio}</p>
          <p>{user.location}</p>
          <div className="my-4 flex gap-4">
            <Stat label="Tracks" value={user.trackCount} />
            <Stat label="Followers" value={user.followerCount} />
            <Stat label="Following" value={user.followingCount} />
          </div>

          <div className="flex flex-col gap-2 my-4">
            <FollowButton user={user} />
            {user.isFollower && (
              <Button disabled variant="outline">
                Follows Me
              </Button>
            )}
          </div>

          <Mutuals handle={user.handle} />
        </div>
      </div>
    </div>
  )
}

export default UserLayout
