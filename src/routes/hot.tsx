import { TrackTile } from '@/components/track-tile'
import { DJContext } from '@/state/dj'
import { TrackRow } from '@/types/track-row'
import { useQuery } from '@tanstack/react-query'

export function Hot() {
  const { data } = useQuery<TrackRow[]>({ queryKey: [`/api/explore/tracks`] })
  if (!data) return

  const djc: DJContext = {
    path: location.pathname,
    items: data,
  }

  return (
    <div className=" max-w-[900px] mx-auto p-4">
      <h1 className="text-2xl font-bold py-4">Trending</h1>
      {data.map((track, idx) => (
        <TrackTile
          key={track.id}
          track={track}
          djContext={djc}
          rank={idx + 1}
        />
      ))}
    </div>
  )
}
