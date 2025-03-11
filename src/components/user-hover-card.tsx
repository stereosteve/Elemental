import { urlFor } from '@/lib/urlFor'
import { Link } from 'react-router'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { useQuery } from '@tanstack/react-query'
import { UserRow } from '@/types/user-row'
import { ReactNode, useState } from 'react'
import { CidImage } from './cid-image'
import { FollowButton } from './follow-button'
import { Stat } from './stat'

type Props = {
  user: {
    handle: string
    name: string
  }
  children?: ReactNode
}

export function UserHoverCard(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const propUser = props.user
  const children = props.children || (
    <Link to={urlFor.user(propUser)}>{propUser.name}</Link>
  )

  const { data } = useQuery<{ user: UserRow }>({
    queryKey: [`/api/users/${propUser.handle}`],
    enabled: isOpen,
    meta: {
      quiet: true,
    },
  })

  const user = data?.user

  return (
    <HoverCard onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      {user && (
        <HoverCardContent className="w-80 p-0 overflow-hidden" side="right">
          <div
            className="relative h-48 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://creatornode2.audius.co/content/${user.bannerImg}/2000x.jpg')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />

            <div className="absolute w-full bottom-0 p-4 flex gap-4 items-center text-background">
              <CidImage img={user.img} size={80} className="rounded-full" />
              <div>
                <div className="text-lg font-bold leading-4">{user.name}</div>
                <Link to={urlFor.user(user)} className="text-sm">
                  @{user.handle}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-center justify-evenly">
            <Stat label="Tracks" value={user.trackCount} />
            <Stat label="Followers" value={user.followerCount} />
            <Stat label="Following" value={user.followingCount} />
          </div>

          <div className="p-4">
            <p className="text-sm mb-4">{user.bio}</p>
            <FollowButton className="w-full" user={user} />
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  )
}
