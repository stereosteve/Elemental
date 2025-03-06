import clsx from 'clsx'
import { Link } from 'react-router'
import { slugify } from '@/lib/slugify'
import { useDJ, type DJContext } from '@/state/dj'
import type { TrackRow } from '@/types/track-row'
import { CidImage } from './cid-image'

type TrackTileProps = {
  track: TrackRow
  djContext: DJContext
  imgSize?: number
  rank?: number
}

export function TrackTile({ track, djContext, imgSize, rank }: TrackTileProps) {
  const dj = useDJ()
  // const { myId } = useMe()
  // const { data: knownReposters } = useQuery<UserRow[]>({
  //   queryKey: [`/api/tracks/${track.id}/known_reposters`, myId],
  // })
  const isPlaying = dj.isPlaying({ track, djContext: djContext })

  return (
    <div
      className={clsx(
        'flex items-center p-2 px-4 gap-4 rounded-md',
        isPlaying && 'bg-secondary'
      )}
      key={track.id}
    >
      <div className="relative rounded-md overflow-clip">
        {rank && (
          <div className="absolute top-0 left-0 rounded-br-md bg-accent text-sm py-2 w-[38px] text-center">
            {rank}
          </div>
        )}
        <CidImage
          img={track.img}
          size={imgSize}
          onClick={() => dj.play(track, djContext)}
        />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="text-xl font-bold">
          <Link
            to={`/user/${track.user.handle}/${slugify(track.title)}/${
              track.id
            }`}
          >
            {track.title}
          </Link>
        </div>
        <div className="flex gap-2">
          <Link to={`/user/${track.user.handle}`}>{track.user.name}</Link>
        </div>
      </div>

      <div className="flex pl-[8px]">
        {track.knownReposters?.map((user) => (
          <CidImage
            key={user.id}
            img={user.img}
            size={32}
            className="rounded-full ml-[-8px]"
          />
        ))}
      </div>
    </div>
  )
}
