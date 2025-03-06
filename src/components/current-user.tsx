import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { Button } from './ui/button'

export function CurrentUser() {
  const { myId, become } = useMe()
  const { data } = useQuery<UserRow[]>({
    queryKey: [`/api/users?id=${myId}`],
    enabled: !!myId,
  })
  const me = data && data[0]
  if (!me) return null

  return (
    <div className="p-2 bg-secondary">
      <b>{me.handle}</b>
      <br />
      <Button
        onClick={() => {
          become()
          // revalidator.revalidate()
        }}
      >
        logout
      </Button>
    </div>
  )
}
