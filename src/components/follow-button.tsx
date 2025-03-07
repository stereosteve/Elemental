import { useMe } from '@/state/me'
import { Button } from './ui/button'

type Props = {
  handle: string
  isFollowed: boolean
}

export function FollowButton({ handle, isFollowed }: Props) {
  const { myHandle } = useMe()
  if (myHandle == handle) return null

  return isFollowed ? (
    <Button>Following</Button>
  ) : (
    <Button variant="outline">Follow</Button>
  )
}
