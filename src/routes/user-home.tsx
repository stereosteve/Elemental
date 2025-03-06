import { DJContext, useDJ } from '@/state/dj'
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
  const dj = useDJ()
  const { handle } = useParams()
  const { data } = useQuery<UserResp>({
    queryKey: [`/api/users/${handle}`],
  })

  // todo: loading / error state
  if (!data) return null

  const { user, tracks } = data

  const djc: DJContext = {
    path: location.pathname,
    items: tracks,
  }

  return (
    <div>
      handle here: {handle} {user.name}
      {tracks.map((track) => (
        <div key={track.id}>
          <button onClick={() => dj.play(track, djc)}>{track.title}</button>
        </div>
      ))}
    </div>
  )
}
