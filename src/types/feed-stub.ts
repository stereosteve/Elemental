import type { PlaylistRow } from './playlist-row'
import type { TrackRow } from './track-row'
import type { UserRow } from './user-row'

export type FeedStub = {
  actorId: number
  verb: string
  objType: string
  objId: number
  createdAt: string

  // for comments...
  text?: string

  actor?: UserRow
  track?: TrackRow
  playlist?: PlaylistRow
}
