import type { UserRow } from './user-row'

export type TrackRow = {
  type: 'track'
  id: number
  title: string
  img: string
  createdAt: string

  repostCount: number
  saveCount: number
  commentCount: number

  user: {
    id: number
    handle: string
    name: string
  }

  knownReposters?: UserRow[]
}
