import { PlaylistTile } from '@/components/playlist-tile'
import { TrackTile } from '@/components/track-tile'
import type { FeedStub } from '@/types/feed-stub'
import type { DJContext } from '@/state/dj'
import { simpleFetch } from '@/client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useLocation } from 'react-router'
import { Loader2Icon } from 'lucide-react'
import { useMe } from '@/state/me'
// import { useMe } from '@/state/me'

export default function Feed() {
  const location = useLocation()
  const { myId } = useMe()

  const { data, fetchNextPage, isFetchingNextPage, isLoading, isFetching } =
    useInfiniteQuery({
      queryKey: ['feed', myId],
      queryFn: async ({ pageParam }) => {
        const res = await simpleFetch(`/api/feed/${myId}?before=${pageParam}`)
        return res as FeedStub[]
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1].created_at
      },
      enabled: !!myId,
    })

  if (!myId) {
    return <div className="p-24">Log In to see feed</div>
  }

  const feed = data?.pages.flat() || []

  const djContext: DJContext = {
    path: location.pathname,
    items: feed.map((r) => r.track || r.playlist!).filter(Boolean),
  }

  return (
    <div className="container mx-auto pb-8">
      {isFetching && (
        <Loader2Icon className="animate-spin fixed top-4 right-4" size={48} />
      )}

      {feed.map((stub) => (
        <div key={stub.created_at} className="p-2 border m-2">
          <div>
            {stub.created_at} - {stub.obj_type}:{stub.obj_id} -{' '}
            {stub.actor?.handle}
          </div>
          {stub.track && <TrackTile track={stub.track} djContext={djContext} />}
          {stub.playlist && (
            <PlaylistTile playlist={stub.playlist} djContext={djContext} />
          )}
        </div>
      ))}

      {!isLoading && feed.length > 0 && (
        <Button disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
          More
        </Button>
      )}
    </div>
  )
}
