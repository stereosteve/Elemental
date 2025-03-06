import { useDJ } from '@/state/dj'
import clsx from 'clsx'
import { ListIcon } from 'lucide-react'
import { Link } from 'react-router'
import { AudioPlayer } from './audio'
import { CidImage } from './cid-image'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import { hashid } from '@/lib/hashid'

export function Player() {
  const dj = useDJ()
  const { track } = dj
  if (!track || !dj.djContext) return null
  const src = `https://discoveryprovider3.audius.co/v1/tracks/${hashid.encode(
    track.id
  )}/stream`
  return (
    <>
      <div style={{ height: 90 }}></div>
      <div className="fixed bottom-0 w-full p-2 bg-background border-t">
        <div className="flex gap-2 items-center">
          <CidImage img={track.img} size={50} />
          <div>
            <div className="font-bold">{track.title}</div>
            <div>
              <Link to={`/user/${track.user.handle}`}>{track.user.name}</Link>
            </div>
          </div>

          <AudioPlayer src={src} />

          <div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <ListIcon />
                </Button>
              </SheetTrigger>

              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Now Playing</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 overflow-y-auto">
                  {dj.djContext.items.map((item, idx) => {
                    const itemClass = 'px-4 py-2'
                    return item.type == 'track' ? (
                      <div
                        key={idx}
                        className={clsx(
                          itemClass,
                          dj.isPlaying({ track: item }) && 'bg-secondary'
                        )}
                        onClick={() => dj.play(item)}
                      >
                        {item.title}
                      </div>
                    ) : (
                      <div key={idx} className={itemClass}>
                        <div
                          className="font-bold"
                          onClick={() => dj.playPlaylist(item, item.tracks[0])}
                        >
                          {item.name}
                        </div>
                        {item.tracks.map((track, idx) => (
                          <div
                            onClick={() => dj.playPlaylist(item, track)}
                            className={clsx(
                              'ml-2',
                              dj.isPlaying({ playlist: item, track }) &&
                                'bg-secondary'
                            )}
                          >
                            {idx + 1} {track.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </ScrollArea>
                <SheetFooter>
                  <div className="bg-secondary p-4">Enjoy!</div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  )
}
