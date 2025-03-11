import { urlFor } from '@/lib/urlFor'
import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router'
import { CidImage } from './cid-image'
import { LoginModal } from './login-modal'
import { LogOutIcon } from 'lucide-react'
import { Button } from './ui/button'

export function CurrentUser() {
  const { myHandle, become } = useMe()
  const { data } = useQuery<{ user: UserRow }>({
    queryKey: [`/api/users/${myHandle}`],
    enabled: !!myHandle,
  })

  if (!data) return <LoginModal />

  const me = data.user

  return (
    <>
      <NavLink
        to={urlFor.user(me)}
        className="flex items-center justify-center w-16 h-16"
      >
        <CidImage img={me.img} size={48} />
      </NavLink>
      <Button
        variant="link"
        className="flex items-center justify-center w-16 h-16"
        onClick={() => become()}
      >
        <LogOutIcon />
      </Button>
    </>
  )
}
