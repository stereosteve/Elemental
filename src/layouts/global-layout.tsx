import { Player } from '@/components/player'
import { AudioWaveformIcon, HomeIcon, Loader2Icon, RssIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import './global-layout.css'
import { useIsFetching } from '@tanstack/react-query'

const navItems = [
  { to: '/', icon: <HomeIcon /> },
  { to: '/feed', icon: <RssIcon /> },
  { to: '/explore/genres', icon: <AudioWaveformIcon /> },
]

export function GlobalLayout() {
  const isFetching = useIsFetching()

  return (
    <div>
      {isFetching > 0 && (
        <Loader2Icon className="animate-spin fixed top-4 right-4" size={48} />
      )}
      <div className="nav-rail">
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
      <Player />
    </div>
  )
}
