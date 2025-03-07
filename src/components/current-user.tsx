import { useMe } from '@/state/me'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { Button } from './ui/button'
import { CidImage } from './cid-image'
import { Link } from 'react-router'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { urlFor } from '@/lib/urlFor'

export function CurrentUser() {
  const { myId, become } = useMe()
  const { data } = useQuery<UserRow[]>({
    queryKey: [`/api/users?id=${myId}`],
    enabled: !!myId,
  })
  const me = data && data[0]
  if (!me) return null

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={urlFor.user(me)}>
          <CidImage img={me.img} size={48} />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 overflow-clip" side="right">
        <img
          loading="lazy"
          decoding="async"
          key={me.bannerImg}
          className="h-32 w-full object-cover"
          src={`https://creatornode2.audius.co/content/${me.bannerImg}/2000x.jpg`}
        />
        <div className="p-4">
          <div>{me.name}</div>
          <Link to={urlFor.user(me)}>{me.handle}</Link>

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
      </HoverCardContent>
    </HoverCard>
  )
}
