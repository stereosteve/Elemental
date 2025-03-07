import { urlFor } from '@/lib/urlFor'
import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

type Props = {
  handle: string
}

export function Mutuals({ handle }: Props) {
  const { myHandle } = useMe()
  const isSelf = myHandle == handle

  const { data } = useQuery<UserRow[]>({
    queryKey: [`/api/users/${handle}/mutuals`],
    enabled: Boolean(myHandle) && !isSelf,
  })

  if (isSelf || !data?.length) return null

  return (
    <div>
      <div className="p-1 font-bold">Mutuals</div>
      {data.map((user) => (
        <div key={user.id} className="p-1">
          <Link to={urlFor.user(user)}>{user.name}</Link>
        </div>
      ))}
    </div>
  )
}
