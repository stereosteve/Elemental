import { useDJ, type DJContext } from '@/state/dj'
import type { PlaylistRow } from '@/types/playlist-row'
import clsx from 'clsx'
import { Link } from 'react-router'
import { CidImage } from './cid-image'
import { RepostButton } from './repost-button'
import { SaveButton } from './save-button'
import { useMe } from '@/state/me'
import { urlFor } from '@/lib/urlFor'

type PlaylistTileProps = {
  playlist: PlaylistRow
  djContext: DJContext
}

export function PlaylistTile({ playlist, djContext }: PlaylistTileProps) {
  const { myHandle } = useMe()
  const dj = useDJ()

  const isPlaying = dj.isPlaying({ playlist, djContext })

  return (
    <div className={clsx(isPlaying ? '' : '')} key={playlist.id}>
      <div className="flex gap-4 items-center">
        <CidImage
          img={playlist.img}
          size={80}
          onClick={() =>
            dj.playPlaylist(playlist, playlist.tracks[0], djContext)
          }
        />
        <div>
          <div className="text-2xl font-black">{playlist.name}</div>
          <div className="flex gap-2">
            <Link to={urlFor.user(playlist.user)}>{playlist.user.name}</Link>
            <div>{new Date(playlist.createdAt).toDateString()}</div>
            {playlist.user.handle != myHandle && (
              <div>
                <SaveButton isSaved={playlist.isSaved} />
                <RepostButton isReposted={playlist.isReposted} />
              </div>
            )}
          </div>
        </div>
      </div>

      {playlist.tracks.map((track, idx) => (
        <div
          className={clsx(
            'rounded-md p-1 px-2',
            dj.isPlaying({ playlist, track, djContext }) ? 'bg-secondary' : ''
          )}
          key={idx}
        >
          <div className="flex gap-2" key={track.id}>
            <div className="text-muted-foreground">{idx + 1}.</div>
            <div>
              <div
                className="font-bold cursor-pointer"
                onClick={() => dj.playPlaylist(playlist, track, djContext)}
              >
                {track.title}
              </div>
              <div className="text-muted-foreground">
                <Link to={urlFor.user(track.user)}>{track.user.name}</Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
