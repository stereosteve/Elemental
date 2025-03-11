import { LoginModal } from '@/components/login-modal'
import { PageTitle } from '@/components/page-title'
import { UserSearch } from '@/components/user-search'
import { useMe } from '@/state/me'
import Feed from './feed'
import { Hot } from './hot'

export function Home() {
  const me = useMe()

  if (me) {
    return <Feed />
  } else {
    return <Hot />
  }

  return (
    <div className="p-24">
      <PageTitle title="Home" />
      <UserSearch
        onSelect={(user) => {
          console.log('howdy', user)
          me.become(user.handle)
        }}
      />

      <LoginModal />
    </div>
  )
}
