import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { Button } from './ui/button'
import { CidImage } from './cid-image'
import { Link } from 'react-router'

export function CurrentUser() {
  const { myId, become } = useMe()
  const { data } = useQuery<UserRow[]>({
    queryKey: [`/api/users?id=${myId}`],
    enabled: !!myId,
  })
  const me = data && data[0]
  if (!me) return null

  return (
    <div className="p-2 bg-secondary flex gap-2">
      <CidImage img={me.img} />
      <div className="flex-grow">
        <div>{me.name}</div>
        <Link to={`/${me.handle}`}>{me.handle}</Link>
      </div>
      <div>
        <Button
          onClick={() => {
            become()
          }}
        >
          logout
        </Button>
      </div>
    </div>
  )
}
