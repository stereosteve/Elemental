import { PageTitle } from '@/components/page-title'
import { UserSearch } from '@/components/user-search'
import { useMe } from '@/state/me'

export function Home() {
  const me = useMe()
  return (
    <div className="p-24">
      <PageTitle title="Home" />

      <UserSearch
        onSelect={(user) => {
          console.log('howdy', user)
          me.become(user.handle)
        }}
      />
    </div>
  )
}
