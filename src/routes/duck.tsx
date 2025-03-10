import { simpleFetch } from '@/client'
import { CidImage } from '@/components/cid-image'
import { Input } from '@/components/ui/input'
import { UserHoverCard } from '@/components/user-hover-card'
import { loadDuckDB } from '@/lib/loadDuckDB'
import { useDJ } from '@/state/dj'
import * as duckdb from '@duckdb/duckdb-wasm'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import React, { useEffect, useState } from 'react'

const tableName = `tracks.csv`

type Row = {
  track_id: string
  title: string
  img: string
  user_handle: string
  user_name: string
}

export const Duck: React.FC = () => {
  const dj = useDJ()
  const [q, setQ] = useState('')

  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const q2 = useDebounce(q, 300)

  const { data } = useQuery({
    queryKey: [q2, loading],
    queryFn: async () => {
      if (!db) return []

      console.log('query', q2)
      const conn = await db.connect()
      const query = await conn.query(`
        SELECT * FROM '${tableName}'
        where
          user_handle ilike '%${q2}%'
          OR user_name ilike '%${q2}%'
          OR title ilike '%${q2}%'
        order by repost_count desc
        limit 100
      `)
      const result = query.toArray().map((row) => row.toJSON())
      await conn.close()
      return result as Row[]
    },
  })

  useEffect(() => {
    try {
      setLoading(true)
      const dataReq = fetch('/data/tracks6.csv.gz').then((r) => r.bytes())
      loadDuckDB().then(async (db) => {
        const data = await dataReq
        await db.registerFileBuffer(tableName, data)
        setDb(db)
        setLoading(false)
      })
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  function playTrack({ track_id }: Record<string, string>) {
    simpleFetch(`/api/tracks/${track_id}`).then((resp) => {
      dj.play(resp.track, {
        path: location.pathname,
        items: [resp.track],
      })
    })
  }

  return (
    <div className="p-8">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <Input value={q} onChange={(e) => setQ(e.target.value)} />

      {data && data.length > 0 && (
        <table className="library-table">
          <tbody>
            {data.map((row, index) => (
              <tr key={index} onClick={() => playTrack(row)}>
                <td>
                  <CidImage img={row.img} size={48} />
                </td>
                <td>
                  <div className="font-bold">{row.title}</div>
                  <UserHoverCard
                    user={{ handle: row.user_handle, name: row.user_name }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
