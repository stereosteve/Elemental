import type { TrackRow } from './track-row'

export type PlaylistRow = {
  type: 'playlist'
  id: number
  name: string
  img: string
  createdAt: string

  playlist_contents: {
    track_ids: Array<{
      time: number
      track: number
    }>
  }

  user: {
    id: number
    handle: string
    name: string
  }

  tracks: TrackRow[]
}
