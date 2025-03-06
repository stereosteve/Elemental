import type { PlaylistRow } from './playlist-row'
import type { TrackRow } from './track-row'
import type { UserRow } from './user-row'

export type FeedStub = {
  actor_id: number
  verb: string
  obj_type: string
  obj_id: number
  created_at: string

  // for comments...
  text?: string

  actor?: UserRow
  track?: TrackRow
  playlist?: PlaylistRow
}
