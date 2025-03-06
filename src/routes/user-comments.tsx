import { TrackTile } from '@/components/track-tile'
import { DJContext } from '@/state/dj'
import { FeedStub } from '@/types/feed-stub'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

type UserResp = {
  user: UserRow
  comments: FeedStub[]
}

export function UserComments() {
  const { handle } = useParams()
  const { data } = useQuery<UserResp>({
    queryKey: [`/api/users/${handle}/comments`],
  })

  if (!data) return null

  const { comments } = data
  const items = comments.map((c) => c.track || c.playlist!)
  const djContext: DJContext = {
    path: location.pathname,
    items,
  }

  return (
    <div>
      {comments.map((stub, idx) => (
        <div className="p-4" key={idx}>
          <div className="text-xl p-4 bg-accent rounded-md">{stub.text!}</div>
          <div className="ml-4">
            {stub.track && (
              <TrackTile
                track={stub.track}
                djContext={djContext}
                imgSize={40}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
