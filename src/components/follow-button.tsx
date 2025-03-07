import { Button } from './ui/button'

type Props = {
  isFollowed: boolean
}

export function FollowButton({ isFollowed }: Props) {
  return isFollowed ? (
    <Button>Following</Button>
  ) : (
    <Button variant="outline">Follow</Button>
  )
}
