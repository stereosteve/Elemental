import { Button } from '@/components/ui/button'
import { Link } from 'react-router'

export function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Button>Click me</Button>

      <div className="flex flex-col gap-2">
        <Link to="/feed">Feed</Link>
        <Link to="/explore/genres">Genres</Link>
      </div>
    </div>
  )
}
