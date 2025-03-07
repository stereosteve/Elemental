import { simpleFetch } from '@/client'
import { RepostButton } from '@/components/repost-button'
import { SaveButton } from '@/components/save-button'
import { Button } from '@/components/ui/button'
import { urlFor } from '@/lib/urlFor'
import { useMe } from '@/state/me'
import { FeedStub } from '@/types/feed-stub'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

export function Library() {
  const { myId } = useMe()
  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['library'],
    queryFn: async ({ pageParam }) => {
      const res = await simpleFetch(`/api/my/library?before=${pageParam}`)
      return res as FeedStub[]
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      return lastPage[lastPage.length - 1].created_at
    },
    enabled: !!myId,
  })

  // const { data } = useQuery<FeedStub[]>({ queryKey: [`/api/my/saves`] })
  if (!data) return

  const justTracks = data.pages.flat().filter((s) => s.track)

  return (
    <div className="container mx-auto">
      <table className="library-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Released</th>
            <th>Saved</th>
            {/* <th>Duration</th> */}
            {/* <th>Plays</th> */}
            <th>Reposts</th>
          </tr>
        </thead>
        <tbody>
          {justTracks.map((stub, idx) => (
            <tr key={idx}>
              <td>
                <Link to={urlFor.track(stub.track!)}>{stub.track!.title}</Link>
              </td>
              <td>
                <Link to={urlFor.user(stub.track!.user)}>
                  {stub.track!.user.name}
                </Link>
              </td>
              <td>{stub.track!.createdAt}</td>
              <td>{stub.created_at}</td>
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

      <Button onClick={() => fetchNextPage()}>More</Button>
    </div>
  )
}
