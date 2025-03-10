import React, { useEffect, useState } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import { Input } from '@/components/ui/input'
import { loadDuckDB } from '@/lib/loadDuckDB'
import { useDJ } from '@/state/dj'
import { simpleFetch } from '@/client'
import { TrackRow } from '@/types/track-row'

export const Duck: React.FC = () => {
  const dj = useDJ()
  const [q, setQ] = useState('')
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null)
  const [data, setData] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setLoading(true)
      loadDuckDB().then(async (db) => {
        const resp = await fetch('/howdy.csv')
        const data = await resp.text()
        await db.registerFileText(`tracks.csv`, data)
        setDb(db)
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    db?.connect().then(async (conn) => {
      const query = await conn.query(`
        SELECT * FROM 'tracks.csv'
        where
          handle ilike '%${q}%'
          OR name ilike '%${q}%'
          OR title ilike '%${q}%'
        limit 100
      `)
      const result = query.toArray().map((row) => row.toJSON())
      setData(result)

      await conn.close()
    })
  }, [db, q])

  function playTrack({ track_id }: Record<string, string>) {
    simpleFetch(`/api/tracks/${track_id}`).then((resp) => {
      dj.play(resp.track)
    })
  }

  return (
    <div className="p-8">
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <Input value={q} onChange={(e) => setQ(e.target.value)} />

      {!loading && !error && data.length > 0 && (
        <table className="library-table">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} onClick={() => playTrack(row)}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
