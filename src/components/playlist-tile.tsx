import { urlFor } from '@/lib/urlFor'
import { useDJ, type DJContext } from '@/state/dj'
import { useMe } from '@/state/me'
import type { PlaylistRow } from '@/types/playlist-row'
import clsx from 'clsx'
import { useNavigate } from 'react-router'
import { CidImage } from './cid-image'
import { RepostButton } from './repost-button'
import { SaveButton } from './save-button'
import { ScrollArea } from './ui/scroll-area'
import { UserHoverCard } from './user-hover-card'

type PlaylistTileProps = {
  playlist: PlaylistRow
  djContext: DJContext
}

export function PlaylistTile({ playlist, djContext }: PlaylistTileProps) {
  const navigate = useNavigate()
  const { myHandle } = useMe()
  const dj = useDJ()

  const isPlaying = dj.isPlaying({ playlist, djContext })

  return (
    <div
      className={clsx(
        'border rounded-md shadow-md mb-4 bg-background',
        isPlaying ? '' : ''
      )}
      key={playlist.id}
    >
      <div className="flex gap-4 items-center p-4">
        <CidImage
          img={playlist.img}
          size={80}
          onClick={() =>
            dj.playPlaylist(playlist, playlist.tracks[0], djContext)
          }
        />
        <div className="flex-grow">
          <div className="text-2xl font-black">{playlist.name}</div>
          <div className="flex gap-2">
            <UserHoverCard user={playlist.user} />
            <div>{new Date(playlist.createdAt).toDateString()}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {playlist.user.handle != myHandle && (
            <>
              <SaveButton isSaved={playlist.isSaved} />
              <RepostButton isReposted={playlist.isReposted} />
            </>
          )}

          <div className="pl-[8px]">
            {playlist.knownReposters?.map((user) => (
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

      <ScrollArea className="h-64">
        {playlist.tracks.map((track, idx) => (
          <div
            className={clsx(
              'p-1 px-2 border-t text-sm',
              'flex gap-2',
              dj.isPlaying({ playlist, track, djContext }) ? 'bg-accent' : ''
            )}
            key={idx}
            onClick={() => dj.playPlaylist(playlist, track, djContext)}
          >
            <div className="text-muted-foreground">{idx + 1}.</div>
            <div className="flex flex-grow gap-2">
              <div className="font-bold cursor-pointer">{track.title}</div>
              <UserHoverCard user={track.user} />
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  )
}
