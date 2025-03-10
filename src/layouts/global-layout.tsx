import { CurrentUser } from '@/components/current-user'
import { Player } from '@/components/player'
import { Toaster } from '@/components/ui/sonner'
import { useIsFetching } from '@tanstack/react-query'
import {
  AudioWaveformIcon,
  FlameIcon,
  HeartIcon,
  HistoryIcon,
  Loader2Icon,
  MountainIcon,
  Table2Icon,
  WindIcon,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

const navItems = [
  { to: '/', icon: <MountainIcon /> },
  { to: '/feed', icon: <WindIcon /> },
  { to: '/hot', icon: <FlameIcon /> },
  { to: '/library', icon: <HeartIcon /> },
  { to: '/play-history', icon: <HistoryIcon /> },
  { to: '/explore/genres', icon: <AudioWaveformIcon /> },
  { to: '/duck', icon: <Table2Icon /> },
]

export function GlobalLayout() {
  // use meta.quiet to surpress global loading indicator
  // (e.g. UserHoverCard)
  const isFetching = useIsFetching({
    predicate: (q) => !q.meta?.quiet,
  })

  return (
    <div>
      {isFetching > 0 && (
        <Loader2Icon className="animate-spin fixed top-4 right-12" size={48} />
      )}
      <div className="nav-rail z-10 bg-background">
        <CurrentUser />

        {navItems.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            className="flex items-center justify-center w-16 h-16"
          >
            {i.icon}
          </NavLink>
        ))}
      </div>
      <div className="ml-16">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
      <Player />
    </div>
  )
}
