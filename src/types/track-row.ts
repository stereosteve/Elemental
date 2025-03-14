import type { UserRow } from './user-row'

export type TrackRow = {
  type: 'track'
  id: number
  title: string
  img: string
  createdAt: string
  releaseDate: string

  duration: number
  genre: string
  tags: string
  bpm: number
  musicalKey: string

  repostCount: number
  saveCount: number
  commentCount: number

  streamConditions:
    | PurchaseCondition
    | TipCondition
    | FollowCondition
    | NftCondition

  user: {
    handle: string
    name: string
    location?: string

    // added for es
    followerCount?: number
  }

  // personalization...
  knownReposters?: UserRow[]
  isReposted: boolean
  isSaved: boolean
}

type PurchaseCondition = {
  usdc_purchase: {
    price: number
  }
}

type TipCondition = {
  tip_user_id: number
}

type FollowCondition = {
  follow_user_id: number
}

type NftCondition = {
  nft_collection: {
    name: string
  }
}
