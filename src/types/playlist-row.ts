import type { TrackRow } from './track-row'
import { UserRow } from './user-row'

export type PlaylistRow = {
  type: 'playlist'
  id: number
  name: string
  img: string
  createdAt: string

  playlistContents: {
    trackIds: Array<{
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

  isSaved: boolean
  isReposted: boolean
  knownReposters?: UserRow[]
}
