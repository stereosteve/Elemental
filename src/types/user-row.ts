export type UserRow = {
  type: 'user'
  id: number
  name: string
  handle: string
  bio: string
  location: string
  img: string
  bannerImg: string
  createdAt: string

  trackCount: number
  playlistCount: number
  albumCount: number
  repostCount: number
  followerCount: number
  followingCount: number

  isFollowed: boolean
  isFollower: boolean
}
