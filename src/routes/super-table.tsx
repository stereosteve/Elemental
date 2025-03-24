import React, { useEffect, useState } from 'react'

import { simpleFetch } from '@/client'
import { CidImage } from '@/components/cid-image'
import { SearchFilter } from '@/components/search-filter'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { UserHoverCard } from '@/components/user-hover-card'
import { formatDuration } from '@/lib/formatDuration'
import { DJContext, useDJ } from '@/state/dj'
import { TrackRow } from '@/types/track-row'
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { FilterXIcon, Loader2Icon } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { sortCodec } from '@/lib/sortCodec'
import { useDebounce } from '@uidotdev/usehooks'
import { formatNumber } from '@/lib/formatNumber'

const fetchSize = 200

type AggBucket = {
  key: string
  doc_count: number
}

export type TrackSearchResponse = {
  tracks: TrackRow[]
  totalRowCount: number
}

type FacetResponse = {
  artist: AggBucket[]
  genre: AggBucket[]
  bpm: AggBucket[]
  musicalKey: AggBucket[]
  user_location: AggBucket[]
}

export default function SuperTable() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')

  function querySet(key: string, val: string) {
    searchParams.set(key, val)
    setSearchParams(searchParams)
  }

  function queryToggle(key: string, val: string) {
    if (searchParams.has(key, val)) {
      searchParams.delete(key, val)
    } else {
      searchParams.set(key, val)
    }
    setSearchParams(searchParams)
  }

  const { data: count } = useQuery<number>({
    queryKey: [`/api/search/count?${searchParams}`],
    meta: {
      quiet: true,
    },
  })

  return (
    <div className="p-4 flex flex-col gap-2 h-screen">
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          querySet('q', e.target.value)
        }}
        placeholder="Search..."
        className="p-5 bg-background"
      />

      <div className="flex gap-4 items-center">
        <FilterBox name="Genre" fieldName="genre" />
        <FilterBox name="Artist" fieldName="artist" />
        <FilterBox name="BPM" fieldName="bpm" />
        <FilterBox name="Key" fieldName="musicalKey" />
        <FilterBox name="Location" fieldName="user_location" />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="download"
            checked={searchParams.get('download') == 'true'}
            onCheckedChange={() => queryToggle('download', 'true')}
          />
          <label htmlFor="download" className="text-sm font-medium">
            Download
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remix"
            checked={searchParams.get('remix') == 'true'}
            onCheckedChange={() => queryToggle('remix', 'true')}
          />
          <label htmlFor="remix" className="text-sm font-medium">
            Remix
          </label>
        </div>

        <div className="flex-grow" />

        <div className="text-sm font-medium text-secondary-foreground">
          {formatNumber(count)} Tracks
        </div>
        <Button
          onClick={() => {
            setQ('')
            setSearchParams()
          }}
          variant="ghost"
        >
          <FilterXIcon />
        </Button>
      </div>

      <VirtualTable />
    </div>
  )
}

function FilterBox({
  name,
  fieldName,
}: {
  name: string
  fieldName: keyof FacetResponse
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const { data, isFetching } = useQuery<AggBucket[]>({
    queryKey: [`/api/search/facet/${fieldName}?` + searchParams.toString()],
    enabled: open,
    meta: {
      quiet: true,
    },
  })

  function queryToggle(key: string, val: string) {
    if (searchParams.has(key, val)) {
      searchParams.delete(key, val)
    } else {
      searchParams.set(key, val)
    }
    setSearchParams(searchParams)
  }

  return (
    <SearchFilter
      name={name}
      buckets={data || []}
      isFetching={isFetching}
      open={open}
      setOpen={setOpen}
      value={searchParams.get(fieldName) || ''}
      onChange={(v) => queryToggle(fieldName, v)}
    />
  )
}

function VirtualTable() {
  const dj = useDJ()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamString = useDebounce(searchParams.toString(), 200)

  const sortParam = searchParams.get('sort')
  const sorting = sortParam ? sortCodec.decode(sortParam) : []

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const columns = React.useMemo<ColumnDef<TrackRow>[]>(
    () => [
      {
        header: '',
        accessorKey: 'img',
        size: 60,
        enableSorting: false,
        cell: ({ row }) => <CidImage img={row.original.img} size={50} />,
      },
      {
        header: 'Title',
        accessorKey: 'title',
        size: 400,
        // cell: (info) => info.getValue(),
      },
      {
        header: 'Artist',
        accessorKey: 'artist',
        size: 200,
        cell: ({ row }) => (
          <UserHoverCard
            user={{
              handle: row.original.user.handle,
              name: row.original.user.name,
            }}
          />
        ),
      },
      {
        header: 'Genre',
        accessorKey: 'genre',
      },
      {
        header: 'Released',
        accessorKey: 'releaseDate',
        accessorFn: (track) => new Date(track.releaseDate).toLocaleDateString(),
        sortDescFirst: true,
        meta: {
          // className: 'justify-end',
        },
      },
      {
        header: 'Length',
        accessorKey: 'duration',
        accessorFn: (track) => formatDuration(track.duration),
        sortDescFirst: true,
        meta: {
          // className: 'justify-end',
        },
      },
      {
        header: 'BPM',
        accessorKey: 'bpm',
        meta: {
          // className: 'justify-end',
        },
      },
      {
        header: 'Key',
        accessorKey: 'musicalKey',
      },
      {
        header: 'Followers',
        accessorKey: 'user.followerCount',
        accessorFn: (t) => formatNumber(t.user.followerCount),
        meta: {
          // className: 'justify-end',
        },
      },
      {
        header: 'Reposts',
        accessorKey: 'repostCount',
        accessorFn: (t) => formatNumber(t.repostCount),
        meta: {
          // className: 'justify-end',
        },
      },
      {
        header: 'Location',
        accessorKey: 'user.location',
        meta: {
          // className: 'justify-end',
        },
      },
    ],
    []
  )

  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<TrackSearchResponse>({
      queryKey: ['super-table', searchParamString],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize
        const fetchedData = await simpleFetch(
          `/api/search?from=${start}&` + searchParamString
        )
        const tracks = fetchedData.body.hits.hits.map((h: any) => h._source)
        return {
          tracks,
          totalRowCount: fetchedData.body.hits.total.value,
        }
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    })

  //flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.tracks) ?? [],
    [data]
  )
  const totalDBRowCount = data?.pages?.[0]?.totalRowCount ?? 0
  const totalFetched = flatData.length

  const djc: DJContext = {
    path: location.pathname,
    items: flatData,
  }

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage()
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  )

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    // debugTable: true,
    onSortingChange: (updater: any) => {
      const s2 = updater(sorting)
      searchParams.set('sort', sortCodec.encode(s2))
      setSearchParams(searchParams)
    },
  })

  function scrollToTop() {
    if (table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0)
    }
  }

  // scroll to top when data changes
  useEffect(scrollToTop, [searchParamString])

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 60, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  })

  if (isLoading) {
    return (
      <Loader2Icon className="animate-spin fixed top-4 right-12" size={48} />
    )
  }

  return (
    <div
      className="border bg-background flex-grow m-2 mb-6"
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
      ref={tableContainerRef}
      style={{
        overflow: 'auto', //our scrollable table container
        position: 'relative', //needed for sticky header
        // height: '700px', //should be a fixed height
      }}
    >
      {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
      <table className="super-table" style={{ display: 'grid' }}>
        <thead
          className="bg-background"
          style={{
            display: 'grid',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ display: 'flex', width: '100%' }}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    style={{
                      display: 'flex',
                      width: header.getSize(),
                    }}
                  >
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            display: 'grid',
            height: `${rowVirtualizer.getTotalSize()}px`, //tells scrollbar how big the table is
            position: 'relative', //needed for absolute positioning of rows
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<TrackRow>
            return (
              <tr
                onClick={() => dj.play(row.original, djc)}
                data-index={virtualRow.index} //needed for dynamic row height measurement
                ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                key={row.id}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                  width: '100%',
                }}
                className={clsx(
                  dj.isPlaying({ track: row.original, djContext: djc }) &&
                    'bg-accent'
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className}
                      style={{
                        fontSize: '95%',
                        display: 'flex',
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
