import { CurrentUser } from '@/components/current-user'
import { UserSearch } from '@/components/user-search'
import { useMe } from '@/state/me'

export function Home() {
  const me = useMe()
  return (
    <div className="p-24">
      <UserSearch
        onSelect={(user) => {
          console.log('howdy', user)
          me.become(user.id)
        }}
      />

      <br />
      <br />
      <CurrentUser />
      <br />
    </div>
  )
}
