import type { UserRow } from '@/types/user-row'
import { CidImage } from '@/components/cid-image'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PageTitle } from '@/components/page-title'

type Resp = {
  genre: string
  users: UserRow[]
}[]

export default function ExploreGenres() {
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
              <Link to={`/${user.handle}`} key={user.id}>
                <CidImage img={user.img} size={150} />
                <div>{user.name}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
