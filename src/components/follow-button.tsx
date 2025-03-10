import { useMe } from '@/state/me'
import { Button } from './ui/button'
import { UserRow } from '@/types/user-row'
import {
  MutationFilters,
  useIsMutating,
  useMutation,
  useMutationState,
} from '@tanstack/react-query'
import { toast } from 'sonner'

type Props = {
  user: UserRow
  className?: string
}

export function FollowButton({ user, className }: Props) {
  const { myHandle } = useMe()
  const mutationKey = ['follow', myHandle, user.handle]

  const filters: MutationFilters = {
    mutationKey,
    predicate: ({ state }) => state.status != 'error',
  }

  const isBusy = useIsMutating(filters) > 0

  const pendingState = useMutationState({
    filters,
    select: (mutation) => mutation.state.variables as boolean,
  }).at(-1)

  const isFollowed = pendingState != undefined ? pendingState : user.isFollowed

  const followMutation = useMutation({
    mutationKey,
    mutationFn: async (shouldFollow: boolean) => {
      // imagine an EntityManager write
      const payload = {
        userId: -1, // todo: need myId
        entityType: 'User',
        entityId: user.id,
        action: shouldFollow ? 'Follow' : 'Unfollow',
      }
      await new Promise((r) => setTimeout(r, 2000))

      // simulate failure sometimes
      if (Math.random() < 0.5) {
        throw new Error(`Simulate failure for ${payload.action}`)
      }
    },
    onError: (_err, shouldFollow) => {
      const action = shouldFollow ? 'follow' : 'unfollow'
      toast.error(`Action Failed`, {
        description: `Failed to ${action} ${user.name}`,
      })
    },
  })

  if (myHandle == user.handle) return null

  return (
    <Button
      className={className}
      onClick={() => followMutation.mutate(!isFollowed)}
      disabled={isBusy}
      variant={isFollowed ? 'ghost' : 'default'}
    >
      {isFollowed ? 'Following' : 'Follow'}
    </Button>
  )
}
