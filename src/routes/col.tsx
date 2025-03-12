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
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { simpleFetch } from '@/client'
import { UserHoverCard } from '@/components/user-hover-card'
import { Input } from '@/components/ui/input'

const fetchSize = 200

type TrakeLite = {
  title: string
  artistHandle: string
  artistName: string
  bpm: number
  genre: string
}

export type TrackSearchResponse = {
  tracks: TrakeLite[]
  totalRowCount: number
}

export default function CoolTable() {
  const [q, setQ] = React.useState('')

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<TrakeLite>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 200,
      },
      {
        accessorKey: 'title',
        size: 500,
        // cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'artistName',
        size: 400,
        cell: ({ row }) => (
          <UserHoverCard
            user={{
              handle: row.original.artistHandle,
              name: row.original.artistName,
            }}
          />
        ),
      },
      {
        accessorKey: 'genre',
      },
      {
        accessorKey: 'bpm',
      },
      {
        accessorKey: 'musical_key',
      },
    ],
    []
  )

  //react-query has a useInfiniteQuery hook that is perfect for this use case
  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<TrackSearchResponse>({
      queryKey: [
        'people',
        q,
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize
        const fetchedData = await simpleFetch(`/api/search`, {
          q,
          from: start.toString(),
        })
        const tracks = fetchedData.body.hits.hits.map((h) => h._source)
        console.log(start, tracks)
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
    estimateSize: () => 33, //estimate row height for accurate scrollbar dragging
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
          onChange={(e) => setQ(e.target.value)}
          className="p-6 bg-background"
        />
      </div>
      ({flatData.length} of {totalDBRowCount} rows fetched)
      <div
        className="table-container"
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
              const row = rows[virtualRow.index] as Row<TrakeLite>
              return (
                <tr
                  data-index={virtualRow.index} //needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} //measure dynamic row height
                  key={row.id}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`, //this should always be a `style` as it changes on scroll
                    width: '100%',
                  }}
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
