import { Player } from '@/components/player'
import { AudioWaveformIcon, HomeIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import './global-layout.css'

const navItems = [
  { to: '/', icon: <HomeIcon /> },
  { to: '/explore/genres', icon: <AudioWaveformIcon /> },
]

export function GlobalLayout() {
  return (
    <div>
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
