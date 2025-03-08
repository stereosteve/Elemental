import { TrackTile } from '@/components/track-tile'
import { DJContext } from '@/state/dj'
import { FeedStub } from '@/types/feed-stub'
import { TrackRow } from '@/types/track-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

type Resp = {
  track: TrackRow
  comments: FeedStub[]
}

export function TrackDetail() {
  const { trackId } = useParams()
  const { data } = useQuery<Resp>({
    queryKey: [`/api/tracks/${trackId}`],
  })

  if (!data) return null

  const { track, comments } = data
  const djContext: DJContext = {
    path: location.pathname,
    items: [track],
  }

  return (
    <div className="p-24">
      <TrackTile track={track} djContext={djContext} />
      {comments.map((stub, idx) => (
        <div className="p-4" key={idx}>
          <div className="text-xl p-4 bg-accent rounded-md">{stub.text!}</div>
          <div className="ml-4">{stub.actor!.handle}</div>
        </div>
      ))}
    </div>
  )
}
