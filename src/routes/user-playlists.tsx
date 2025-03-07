import { PlaylistTile } from '@/components/playlist-tile'
import { DJContext } from '@/state/dj'
import { PlaylistRow } from '@/types/playlist-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

export function UserPlaylists() {
  const { handle } = useParams()
  const { data: playlists } = useQuery<PlaylistRow[]>({
    queryKey: [`/api/users/${handle}/playlists`],
  })

  if (!playlists) return null

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
