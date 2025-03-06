export type UserRow = {
  type: 'user'
  id: number
  name: string
  handle: string
  img: string
  bannerImg: string
  createdAt: string

  trackCount: number
  followerCount: number
  followingCount: number
}
