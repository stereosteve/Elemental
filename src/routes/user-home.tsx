import { TrackTile } from '@/components/track-tile'
import { DJContext } from '@/state/dj'
import { TrackRow } from '@/types/track-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import UserReposts from './user-reposts'

export function UserHome() {
  const { handle } = useParams()
  const { data: tracks, isLoading } = useQuery<TrackRow[]>({
    queryKey: [`/api/users/${handle}/tracks`],
  })

  if (isLoading) return null

  if (!tracks?.length) return <UserReposts />

  const djc: DJContext = {
    path: location.pathname,
    items: tracks,
  }

  return (
    <div className="container">
      {tracks.map((track) => (
        <TrackTile key={track.id} track={track} djContext={djc} />
      ))}
    </div>
  )
}
