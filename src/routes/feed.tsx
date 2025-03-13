import { simpleFetch } from '@/client'
import { PageTitle } from '@/components/page-title'
import { PlaylistTile } from '@/components/playlist-tile'
import { TrackTile } from '@/components/track-tile'
import { Button } from '@/components/ui/button'
import type { DJContext } from '@/state/dj'
import { useMe } from '@/state/me'
import type { FeedStub } from '@/types/feed-stub'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router'

export default function Feed() {
  const location = useLocation()
  const { myHandle } = useMe()

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['feed'],
      queryFn: async ({ pageParam }) => {
        const res = await simpleFetch(`/api/feed?before=${pageParam}`)
        return res as FeedStub[]
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        return lastPage[lastPage.length - 1].created_at
      },
      enabled: !!myHandle,
    })

  if (!myHandle) {
    return <div className="p-24">Log In to see feed</div>
  }

  const feed = data?.pages.flat() || []

  const djContext: DJContext = {
    path: location.pathname,
    items: feed.map((r) => r.track || r.playlist!).filter(Boolean),
  }

  return (
    <div className="max-w-[900px] mx-auto py-8">
      <PageTitle title="Feed" />
      <h1 className="text-2xl font-bold py-4">Feed</h1>

      {feed.map((stub) => (
        <div key={stub.created_at} className="">
          {stub.track && <TrackTile track={stub.track} djContext={djContext} />}
          {stub.playlist && (
            <PlaylistTile playlist={stub.playlist} djContext={djContext} />
          )}
        </div>
      ))}

      <div className="p-12 flex gap-4 justify-center">
        {!isLoading && feed.length > 0 && (
          <Button disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            More
          </Button>
        )}
      </div>
    </div>
  )
}
