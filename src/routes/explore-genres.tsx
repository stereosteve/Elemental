import type { UserRow } from '@/types/user-row'
import { CidImage } from '@/components/cid-image'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'

type Resp = {
  genre: string
  users: UserRow[]
}[]

export default function ExploreGenres() {
  const { data } = useQuery<Resp>({ queryKey: [`/api/explore/genres`] })
  if (!data) return <div>todo</div>
  const genres = data
  return (
    <div className="overflow-x-scroll">
      {genres.map((g) => (
        <div className="p-4 m-4" key={g.genre}>
          <div className="font-bold text-4xl mb-2 sticky left-0">{g.genre}</div>
          <div className="flex gap-4">
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
