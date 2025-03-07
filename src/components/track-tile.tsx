import { useDJ, type DJContext } from '@/state/dj'
import type { TrackRow } from '@/types/track-row'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router'
import { CidImage } from './cid-image'
import { RepostButton } from './repost-button'
import { SaveButton } from './save-button'
import { useMe } from '@/state/me'
import { urlFor } from '@/lib/urlFor'

type TrackTileProps = {
  track: TrackRow
  djContext: DJContext
  imgSize?: number
  rank?: number
}

export function TrackTile({ track, djContext, imgSize, rank }: TrackTileProps) {
  const { myId } = useMe()
  const navigate = useNavigate()
  const dj = useDJ()
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
          <Link to={urlFor.track(track)}>{track.title}</Link>
        </div>
        <div className="flex gap-2">
          <Link to={urlFor.user(track.user)}>{track.user.name}</Link>
        </div>
      </div>

      <div className="flex ">
        {track.user.id != myId && (
          <>
            <SaveButton isSaved={track.isSaved} />
            <RepostButton isReposted={track.isReposted} />
          </>
        )}
        <div className="pl-[8px]">
          {track.knownReposters?.map((user) => (
            <CidImage
              key={user.id}
              img={user.img}
              size={32}
              className="rounded-full ml-[-8px]"
              onClick={() => navigate(urlFor.user(user))}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
