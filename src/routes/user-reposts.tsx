import { PlaylistTile } from '@/components/playlist-tile'
import { TrackTile } from '@/components/track-tile'
import { DJContext } from '@/state/dj'
import { FeedStub } from '@/types/feed-stub'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

type Resp = {
  user: UserRow
  reposts: FeedStub[]
}

export default function UserReposts() {
  const { handle } = useParams()
  const { data } = useQuery<Resp>({
    queryKey: [`/api/users/${handle}/reposts`],
  })

  if (!data) return null
  const { reposts } = data

  const djContext: DJContext = {
    path: location.pathname,
    items: reposts.map((r) => r.track || r.playlist!).filter(Boolean),
  }

  return (
    <div>
      {reposts.map((stub, idx) => (
        <div key={idx}>
          {stub.track && <TrackTile track={stub.track} djContext={djContext} />}
          {stub.playlist && (
            <PlaylistTile playlist={stub.playlist} djContext={djContext} />
          )}
        </div>
      ))}
    </div>
  )
}
