import { PlaylistTile } from '@/components/playlist-tile'
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

export function UserPlaylists() {
  const { handle } = useParams()
  const { data } = useQuery<UserResp>({
    queryKey: [`/api/users/${handle}`],
  })

  if (!data) return null

  const { playlists } = data

  const djc: DJContext = {
    path: location.pathname,
    items: playlists,
  }

  return (
    <div>
      {playlists.map((playlist) => (
        <PlaylistTile key={playlist.id} playlist={playlist} djContext={djc} />
      ))}
    </div>
  )
}
