import { useMe } from '@/state/me'
import Feed from './feed'
import { Hot } from './hot'

export function Home() {
  const { myHandle } = useMe()

  if (myHandle) {
    return <Feed />
  } else {
    return <Hot />
  }
}
