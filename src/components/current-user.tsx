import { urlFor } from '@/lib/urlFor'
import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router'
import { CidImage } from './cid-image'

export function CurrentUser() {
  const { myHandle } = useMe()
  const { data } = useQuery<{ user: UserRow }>({
    queryKey: [`/api/users/${myHandle}`],
    enabled: !!myHandle,
  })
  if (!data) return null
  const me = data.user

  return (
    <NavLink
      to={urlFor.user(me)}
      className="flex items-center justify-center w-16 h-16"
    >
      <CidImage img={me.img} size={48} />
    </NavLink>
  )
}
