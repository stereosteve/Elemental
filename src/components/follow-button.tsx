import { useMe } from '@/state/me'
import { Button } from './ui/button'

type Props = {
  handle: string
  isFollowed: boolean
  className?: string
}

export function FollowButton({ handle, isFollowed, className }: Props) {
  const { myHandle } = useMe()
  if (myHandle == handle) return null

  return isFollowed ? (
    <Button className={className}>Following</Button>
  ) : (
    <Button variant="outline" className={className}>
      Follow
    </Button>
  )
}
