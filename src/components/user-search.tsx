import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { UserRow } from '@/types/user-row'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CidImage } from './cid-image'

type UserSearchProps = {
  onSelect: (user: UserRow) => void
}

export function UserSearch({ onSelect }: UserSearchProps) {
  const [q, setQ] = useState('')

  const u = `/api/users?q=${encodeURIComponent(q)}&limit=20`
  const { data, isFetching } = useQuery<UserRow[]>({
    queryKey: [u],
    enabled: q.length > 2,
  })

  return (
    <div>
      <Command className="rounded-lg md:min-w-[450px]" shouldFilter={false}>
        <CommandInput placeholder="Search" value={q} onValueChange={setQ} />
        <CommandList className="shadow">
          {isFetching && <CommandItem>Loading...</CommandItem>}

          {data?.map((user) => (
            <CommandItem
              key={user.id}
              onSelect={() => {
                onSelect(user)
                // close it:
                setQ('')
              }}
            >
              <CidImage img={user.img} size={40} />
              <div>{user.name}</div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
