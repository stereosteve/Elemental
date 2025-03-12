import React from 'react'
import './colll.css'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { simpleFetch } from '@/client'
import { UserHoverCard } from '@/components/user-hover-card'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'react-router'
import { TrackRow } from '@/types/track-row'
import { DJContext, useDJ } from '@/state/dj'
import clsx from 'clsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CidImage } from '@/components/cid-image'

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
}

export default function CoolTable() {
  const dj = useDJ()
  const [searchParams, setSearchParams] = useSearchParams()

  function querySet(key: string, val: string) {
    searchParams.set(key, val)
    setSearchParams(searchParams)
  }

  function queryToggle(key: string, val: string) {
    if (searchParams.has(key, val)) {
      searchParams.delete(key, val)
    } else {
      searchParams.append(key, val)
    }
    setSearchParams(searchParams)
  }

  const [q, setQ] = React.useState('')

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<TrackRow>[]>(
    () => [
      {
        accessorKey: 'img',
        size: 60,
        enableSorting: false,
        cell: ({ row }) => <CidImage img={row.original.img} size={50} />,
      },
      {
        header: 'Title',
        accessorKey: 'title',
        size: 300,
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
        header: 'Reposts',
        accessorKey: 'repostCount',
      },
      {
        header: 'Genre',
        accessorKey: 'genre',
      },
      {
        header: 'BPM',
        accessorKey: 'bpm',
      },
      {
        header: 'Key',
        accessorKey: 'musicalKey',
      },
    ],
    []
  )

  // todo... add (debounced) q to search params?
  const searchParamString = searchParams.toString()

  React.useEffect(() => {
    console.log(sorting)
    // querySet('sort', JSON.stringify(Object.values(sorting)))
  }, [sorting])

  const { data: facets } = useQuery<FacetResponse>({
    queryKey: [`/api/search/facet?${searchParamString}`],
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  function FilterBox({
    fieldName,
    buckets,
  }: {
    fieldName: keyof FacetResponse
    buckets: AggBucket[]
  }) {
    console.log('render filter box', fieldName)
    return (
      <ScrollArea className="bg-background p-2 flex-1 h-64">
        {buckets.map((b) => (
          <div
            key={b.key}
            onClick={() => queryToggle(fieldName, b.key)}
            className={clsx(
              'flex p-1',
              searchParams.has(fieldName, b.key) && 'bg-amber-300'
            )}
          >
            <div className="flex-grow">{b.key}</div>
            <div>{b.doc_count}</div>
          </div>
        ))}
      </ScrollArea>
    )
  }

  const artistFilter = React.useMemo(() => {
    if (!facets) return null
    return <FilterBox fieldName="artist" buckets={facets['artist']} />
  }, [facets?.artist])

  const genreFilter = React.useMemo(() => {
    if (!facets) return null
    return <FilterBox fieldName="genre" buckets={facets['genre']} />
  }, [facets])

  //react-query has a useInfiniteQuery hook that is perfect for this use case
  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<TrackSearchResponse>({
      queryKey: [
        'people',
        q,
        searchParamString,
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize
        const sort = encodeURIComponent(JSON.stringify(sorting))

        const fetchedData = await simpleFetch(
          `/api/search?from=${start}&sort=${sort}&` + searchParamString
        )
        const tracks = fetchedData.body.hits.hits.map((h: any) => h._source)
        // console.log(topGenres)
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
  })

  //scroll to top of table when sorting changes
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater)
    if (table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0)
    }
  }

  //since this table option is derived from table row model state, we're using the table.setOptions utility
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }))

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
    return <>Loading...</>
  }

  return (
    <div className="p-4">
      <div>
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            // might want to debounce this...
            querySet('q', e.target.value)
          }}
          className="p-6 bg-background"
        />
      </div>

      {/* FILTER BOXES */}
      <div className="flex gap-4 my-4">
        {/* <FilterBox fieldName="genre" />
        <FilterBox fieldName="artist" /> */}
        {genreFilter}
        {artistFilter}
      </div>

      {/* HIT COUNT */}
      <div>
        ({flatData.length} of {totalDBRowCount} rows fetched)
      </div>

      <div
        className="table-container bg-background"
        onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
        ref={tableContainerRef}
        style={{
          overflow: 'auto', //our scrollable table container
          position: 'relative', //needed for sticky header
          height: '600px', //should be a fixed height
        }}
      >
        {/* Even though we're still using sematic table tags, we must use CSS grid and flexbox for dynamic row heights */}
        <table style={{ display: 'grid' }}>
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
              <tr
                key={headerGroup.id}
                style={{ display: 'flex', width: '100%' }}
              >
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
                      'bg-amber-100'
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        style={{
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
      {isFetching && <div>Fetching More...</div>}
    </div>
  )
}
