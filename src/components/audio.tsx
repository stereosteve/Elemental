import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { useDJ } from '@/state/dj'
import { formatDuration } from '@/lib/formatDuration'

export function AudioPlayer({ src }: { src: string }) {
  const dj = useDJ()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  // const [time, setTime] = useState('')
  // const [duration, setDuration] =

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }
    audio.addEventListener('timeupdate', updateProgress)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
    }
  }, [audioRef])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = (value / 100) * audio.duration
    setProgress(value)
  }

  const handleVolumeChange = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = value
    setVolume(value)
  }

  if (!src) return null
  return (
    <div className="flex flex-col items-center gap-1 flex-grow">
      <audio ref={audioRef} src={src} autoPlay onEnded={() => dj.advance(1)} />

      <div className="flex gap-1 items-center">
        <Button variant="outline" onClick={() => dj.advance(-1)}>
          <ChevronLeftIcon />
        </Button>
        <Button onClick={togglePlay} className="p-2">
          {audioRef.current?.paused ? <Play size={24} /> : <Pause size={24} />}
        </Button>
        <Button variant="outline" onClick={() => dj.advance(1)}>
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="w-full max-w-2xl flex gap-2">
        <div className="text-sm">
          {formatDuration(audioRef.current?.currentTime)}
        </div>
        <Slider
          value={[progress]}
          onValueChange={(val) => handleSeek(val[0])}
          max={100}
          className="flex-1"
        />
        <div className="text-sm">
          {formatDuration(audioRef.current?.duration)}
        </div>

        <HoverCard>
          <HoverCardTrigger>
            {volume > 0 ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </HoverCardTrigger>
          <HoverCardContent>
            <Slider
              value={[volume]}
              onValueChange={(val) => handleVolumeChange(val[0])}
              max={1}
              step={0.01}
              className="w-full"
            />
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}
