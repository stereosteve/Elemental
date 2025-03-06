import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

export function UserHome() {
  const { handle } = useParams()
  const { data } = useQuery({
    queryKey: [`/api/users/${handle}`],
  })
  return (
    <div>
      handle here: {handle}
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
    </div>
  )
}
