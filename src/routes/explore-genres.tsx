import type { UserRow } from '@/types/user-row'
import { CidImage } from '@/components/cid-image'
import { Link, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PageTitle } from '@/components/page-title'
import { urlFor } from '@/lib/urlFor'
import { UserHoverCard } from '@/components/user-hover-card'

type Resp = {
  genre: string
  users: UserRow[]
}[]

export default function ExploreGenres() {
  const navigate = useNavigate()
  const { data } = useQuery<Resp>({ queryKey: [`/api/explore/genres`] })
  if (!data) return null
  const genres = data
  return (
    <div className="overflow-x-scroll">
      <PageTitle title="Genres" />
      {genres.map((g) => (
        <div className="m-4" key={g.genre}>
          <div className="flex gap-4">
            <div className="font-bold text-2xl p-4 rounded-md h-[150px] min-w-[220px] text-center bg-black text-white flex items-center justify-center">
              {g.genre}
            </div>
            {g.users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(urlFor.user(user))}
                className="cursor-pointer relative h-[150px] w-[150px] rounded-md shadow-md overflow-clip"
              >
                <CidImage
                  img={user.img}
                  size={150}
                  className="cursor-pointer"
                />
                <div
                  className="
                  absolute bottom-0 w-full
                  bg-black opacity-80 text-white
                   p-1 overflow-hidden text-center"
                >
                  <UserHoverCard user={user} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
