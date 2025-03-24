import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { UserRow } from '@/types/user-row'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { CidImage } from './cid-image'
import { PlaylistRow } from '@/types/playlist-row'
import { TrackRow } from '@/types/track-row'

type UserSearchProps = {
  onSelect: (val: UserRow | TrackRow | PlaylistRow) => void
}

type SuggestResponse = {
  tracks: TrackRow[]
  users: UserRow[]
  playlists: PlaylistRow[]
}

export function UserSearch({ onSelect }: UserSearchProps) {
  const [q, setQ] = useState('')

  const u = `/api/suggest?q=${encodeURIComponent(q)}&limit=20`
  const { data } = useQuery<SuggestResponse>({
    queryKey: [u],
    // enabled: q.length > 0,
    placeholderData: keepPreviousData,
  })

  const items = Object.entries(data || {}).map(([label, hits]) => (
    <CommandGroup heading={label}>
      {hits.map((t) => (
        <CommandItem
          key={t.id}
          onSelect={() => {
            onSelect(t)
            setQ('')
          }}
        >
          <CidImage img={t.img} size={40} />
          <div>{'title' in t ? t.title : t.name}</div>
        </CommandItem>
      ))}
    </CommandGroup>
  ))

  return (
    <div>
      <Command className="rounded-lg md:min-w-[450px]" shouldFilter={false}>
        <CommandInput placeholder="Search" value={q} onValueChange={setQ} />
        <CommandList className="shadow">
          {/* {isFetching && <CommandItem>Loading...</CommandItem>} */}

          {items}
        </CommandList>
      </Command>
    </div>
  )
}
