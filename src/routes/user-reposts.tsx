import { simpleFetch } from '@/client'
import { PlaylistTile } from '@/components/playlist-tile'
import { TrackTile } from '@/components/track-tile'
import { Button } from '@/components/ui/button'
import { DJContext } from '@/state/dj'
import { FeedStub } from '@/types/feed-stub'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Repeat2Icon } from 'lucide-react'
import { useParams } from 'react-router'

type Resp = FeedStub[]

export default function UserReposts() {
  const { handle } = useParams()

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useInfiniteQuery<Resp>({
      queryKey: [`/api/users/${handle}/reposts`],
      queryFn: async ({ pageParam }) => {
        const res = await simpleFetch(`/api/users/${handle}/reposts`, {
          before: pageParam as string,
        })
        return res
      },
      initialPageParam: '',
      getNextPageParam: (reposts) => {
        if (!reposts.length) return null
        return reposts.at(-1)?.createdAt
      },
    })

  if (!data) return null
  const reposts = data.pages.flat()

  const djContext: DJContext = {
    path: location.pathname,
    items: reposts.map((r) => r.track || r.playlist!).filter(Boolean),
  }

  let lastDate = ''
  function dateHeader(stub: FeedStub) {
    const date = new Date(stub.createdAt).toLocaleDateString()
    if (date == lastDate) return null
    lastDate = date
    return (
      <div className="mt-8 p-2 flex gap-2 items-center justify-self-center font-bold">
        <Repeat2Icon />
        {date}
      </div>
    )
  }

  return (
    <div>
      {reposts.map((stub, idx) => (
        <div key={idx}>
          {dateHeader(stub)}
          {stub.track && <TrackTile track={stub.track} djContext={djContext} />}
          {stub.playlist && (
            <PlaylistTile playlist={stub.playlist} djContext={djContext} />
          )}
        </div>
      ))}

      <div className="p-12 flex gap-4 justify-center">
        {!isLoading && hasNextPage && (
          <Button disabled={isFetching} onClick={() => fetchNextPage()}>
            Load More
          </Button>
        )}
      </div>
    </div>
  )
}
