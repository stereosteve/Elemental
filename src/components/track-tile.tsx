import { urlFor } from '@/lib/urlFor'
import { useDJ, type DJContext } from '@/state/dj'
import { useMe } from '@/state/me'
import type { TrackRow } from '@/types/track-row'
import clsx from 'clsx'
import { LockIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { CidImage } from './cid-image'
import { RepostButton } from './repost-button'
import { SaveButton } from './save-button'
import { UserHoverCard } from './user-hover-card'

type TrackTileProps = {
  track: TrackRow
  djContext: DJContext
  imgSize?: number
  rank?: number
}

export function TrackTile({ track, djContext, imgSize, rank }: TrackTileProps) {
  const { myHandle } = useMe()
  const navigate = useNavigate()
  const dj = useDJ()
  const isPlaying = dj.isPlaying({ track, djContext: djContext })

  return (
    <div
      className={clsx(
        'flex items-center p-2 px-4 gap-4 rounded-md border shadow-md mb-4 bg-background',
        isPlaying && 'bg-amber-100 border-amber-500 border-2'
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
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => dj.play(track, djContext)}
        >
          {track.title}
        </div>
        <div className="flex gap-2">
          <UserHoverCard user={track.user} />
          {/* <Link to={urlFor.user(track.user)}>{track.user.name}</Link> */}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        {track.streamConditions && (
          <div title={JSON.stringify(track.streamConditions)}>
            <LockIcon />
          </div>
        )}
        {track.user.handle != myHandle && (
          <>
            <SaveButton isSaved={track.isSaved} />
            <RepostButton isReposted={track.isReposted} />
          </>
        )}
        <div className="pl-[8px]">
          {track.knownReposters?.map((user) => (
            <UserHoverCard user={user} key={user.id}>
              <CidImage
                img={user.img}
                size={32}
                className="rounded-full ml-[-8px] cursor-pointer"
                onClick={() => navigate(urlFor.user(user))}
              />
            </UserHoverCard>
          ))}
        </div>
      </div>
    </div>
  )
}
