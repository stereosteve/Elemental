import { TrackTile } from '@/components/track-tile'
import UserLayout from '@/layouts/user-layout'
import { DJContext } from '@/state/dj'
import { PlaylistRow } from '@/types/playlist-row'
import { TrackRow } from '@/types/track-row'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

type UserResp = {
  user: UserRow
  tracks: TrackRow[]
  playlists: PlaylistRow[]
}

export function UserHome() {
  const { handle } = useParams()
  const { data } = useQuery<UserResp>({
    queryKey: [`/api/users/${handle}`],
  })

  if (!data) return null

  const { user, tracks } = data

  const djc: DJContext = {
    path: location.pathname,
    items: tracks,
  }

  return (
    <UserLayout user={user} container>
      {tracks.map((track) => (
        <TrackTile key={track.id} track={track} djContext={djc} />
      ))}
    </UserLayout>
  )
}
