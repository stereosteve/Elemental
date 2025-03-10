import { hashid } from '@/lib/hashid'
import { urlFor } from '@/lib/urlFor'
import { useDJ } from '@/state/dj'
import clsx from 'clsx'
import { ListIcon } from 'lucide-react'
import { Link } from 'react-router'
import { AudioPlayer } from './audio'
import { CidImage } from './cid-image'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ScrollArea } from './ui/scroll-area'
import { useEffect, useRef, useState } from 'react'

export function Player() {
  const [isOpen, setIsOpen] = useState(false)
  const nowPlayingRef = useRef<HTMLDivElement>(null)
  const dj = useDJ()
  const { track } = dj

  useEffect(() => {
    setTimeout(() => {
      if (isOpen && nowPlayingRef.current) {
        nowPlayingRef.current.scrollIntoView()
      }
    })
  }, [isOpen, nowPlayingRef])

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
              <Link to={urlFor.user(track.user)}>{track.user.name}</Link>
            </div>
          </div>

          <AudioPlayer src={src} />

          <div>
            <Popover onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <ListIcon />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[600px]" sideOffset={20}>
                <ScrollArea className="flex-1 overflow-y-auto h-[60vh]">
                  {dj.djContext.items.map((item, idx) => {
                    const itemClass = 'px-2 py-2 flex items-center gap-2'
                    return item.type == 'track' ? (
                      <div
                        ref={
                          dj.isPlaying({ track: item }) ? nowPlayingRef : null
                        }
                        key={idx}
                        className={clsx(
                          itemClass,
                          dj.isPlaying({ track: item }) && 'bg-secondary'
                        )}
                        onClick={() => dj.play(item)}
                      >
                        <CidImage img={item.img} size={48} />
                        <div className="truncate whitespace-nowrap">
                          <div className="font-bold">{item.title}</div>
                          <div>{item.user.name}</div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        className="mb-4"
                        ref={
                          dj.isPlaying({ playlist: item })
                            ? nowPlayingRef
                            : null
                        }
                      >
                        <div
                          className={itemClass}
                          onClick={() => dj.playPlaylist(item, item.tracks[0])}
                        >
                          <CidImage img={item.img} size={48} />
                          <div className="truncate whitespace-nowrap">
                            <div className="font-bold">{item.name}</div>
                            <div>{item.user.name}</div>
                          </div>
                        </div>
                        {item.tracks.map((track, idx) => (
                          <div
                            key={idx}
                            onClick={() => dj.playPlaylist(item, track)}
                            className={clsx(
                              'ml-4 p-1',
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
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </>
  )
}
