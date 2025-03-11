import { simpleFetch } from '@/client'
import { CidImage } from '@/components/cid-image'
import { RepostButton } from '@/components/repost-button'
import { SaveButton } from '@/components/save-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserHoverCard } from '@/components/user-hover-card'
import { urlFor } from '@/lib/urlFor'
import { DJContext, useDJ } from '@/state/dj'
import { useMe } from '@/state/me'
import { FeedStub } from '@/types/feed-stub'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export function Library() {
  const dj = useDJ()
  const { myHandle } = useMe()
  const [fetchAll, setFetchAll] = useState(false)
  const [q, setQ] = useState('')
  const location = useLocation()

  const endpoint = location.pathname.includes('play-history')
    ? 'play-history'
    : 'library'

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useInfiniteQuery({
      queryKey: [endpoint, myHandle],
      queryFn: async ({ pageParam }) => {
        const res = await simpleFetch(`/api/my/${endpoint}?before=${pageParam}`)
        return res as FeedStub[]
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => {
        // this should match limit in user library query
        if (lastPage.length < 100) return null
        return lastPage[lastPage.length - 1].created_at
      },
      enabled: !!myHandle,
    })

  useEffect(() => {
    if (fetchAll && !isFetching && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchAll, fetchNextPage, hasNextPage, isFetching])

  if (!data) return

  const justTracks = data.pages
    .flat()
    .filter((s) => s.track)
    .filter(
      (s) =>
        !q ||
        s.track!.title.toLowerCase().includes(q) ||
        s.track!.user.handle.toLocaleLowerCase().includes(q) ||
        s.track!.user.name.toLocaleLowerCase().includes(q)
    )

  // search will make this kinda weird...
  const djc: DJContext = {
    path: location.pathname,
    items: justTracks.map((s) => s.track!),
  }

  return (
    <div className="container mx-auto py-8">
      <Input
        placeholder="Search..."
        value={q}
        onChange={(e) => {
          setFetchAll(true)
          setQ(e.target.value)
        }}
        className="p-6 bg-background"
      />
      <table className="library-table w-full mt-8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Released</th>
            <th>On</th>
            {/* <th>Duration</th> */}
            {/* <th>Plays</th> */}
            <th>Reposts</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {justTracks.map((stub, idx) => (
            <tr key={idx}>
              <td className="flex gap-4">
                <CidImage
                  img={stub.track!.img}
                  size={50}
                  onClick={() => dj.play(stub.track!, djc)}
                />
                <div>
                  <Link
                    to={urlFor.track(stub.track!)}
                    className="block max-w-96 truncate font-bold"
                  >
                    {stub.track!.title}
                  </Link>

                  <UserHoverCard user={stub.track!.user} />
                </div>
              </td>
              <td>{formatDate(stub.track!.createdAt)}</td>
              <td title={stub.created_at}>{formatDate(stub.created_at)}</td>
              {/* <td>{stub.track!.duration}</td> */}
              {/* <td>{stub.track!.playCount}</td> */}
              <td>{stub.track!.repostCount}</td>
              <td>
                <RepostButton isReposted={stub.track!.isReposted} />
              </td>
              <td>
                <SaveButton isSaved={stub.track!.isSaved} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-12 flex gap-4 justify-center">
        {!isLoading && hasNextPage && (
          <>
            <Button disabled={isFetching} onClick={() => fetchNextPage()}>
              Load More
            </Button>

            <Button disabled={isFetching} onClick={() => setFetchAll(true)}>
              Load All
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString()
}
