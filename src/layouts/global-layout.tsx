import { CurrentUser } from '@/components/current-user'
import { Player } from '@/components/player'
import { ThemeToggle } from '@/components/theme-toggle'
import { Toaster } from '@/components/ui/sonner'
import { useMe } from '@/state/me'
import { useIsFetching } from '@tanstack/react-query'
import {
  AudioWaveformIcon,
  FileSpreadsheetIcon,
  HeartIcon,
  HistoryIcon,
  Loader2Icon,
  MountainIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

export function GlobalLayout() {
  const { myHandle } = useMe()
  const location = useLocation()

  let navItems = [
    { to: '/', icon: <MountainIcon /> },
    { to: '/explore/genres', icon: <AudioWaveformIcon /> },
    { to: '/col', icon: <FileSpreadsheetIcon /> },
  ]

  if (myHandle) {
    navItems = navItems.concat([
      { to: '/hot', icon: <TrendingUpIcon /> },
      { to: '/library', icon: <HeartIcon /> },
      { to: '/play-history', icon: <HistoryIcon /> },
    ])
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

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
      <div className="nav-rail z-10 flex flex-col">
        {navItems.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            className="flex items-center justify-center w-16 h-16"
          >
            {i.icon}
          </NavLink>
        ))}

        <div className="flex-grow" />

        <ThemeToggle />
        <CurrentUser />
      </div>
      <div className="ml-16">
        <Outlet />
      </div>
      <Toaster position="top-center" richColors />
      <Player />
    </div>
  )
}
