import { TrackRow } from '@/types/track-row'
import { slugify } from './slugify'

export const urlFor = {
  user: ({ handle }: { handle: string }) => `/${handle}`,
  track: (track: TrackRow) =>
    `/${track.user.handle}/${slugify(track.title)}/${track.id}`,
}
