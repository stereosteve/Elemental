import { Player } from '@/components/player'
import { Outlet } from 'react-router'

export function GlobalLayout() {
  return (
    <div>
      <Outlet />
      <Player />
    </div>
  )
}
