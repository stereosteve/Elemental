import { create } from 'zustand'
import type { PlaylistRow } from '@/types/playlist-row'
import type { TrackRow } from '@/types/track-row'

// When an item is played,
// DJContext is provided to capture play context
// including path (route) and other items on page
// for autoplay
export type DJContext = {
  path: string
  items: Array<TrackRow | PlaylistRow>
}

export type DJParams = {
  track?: TrackRow
  playlist?: PlaylistRow
  djContext?: DJContext
}

export interface DJState {
  track?: TrackRow
  playlist?: PlaylistRow
  djContext?: DJContext

  play: (track: TrackRow, djContext?: DJContext) => void

  playPlaylist: (
    playlist: PlaylistRow,
    track: TrackRow,
    djContext?: DJContext
  ) => void

  isPlaying: (params: DJParams) => boolean

  advance: (direction: number) => void
}

export const useDJ = create<DJState>()((set, get) => ({
  play: (track, djContext) =>
    set((state) => {
      console.log('play', track)
      return {
        track,
        playlist: undefined,
        djContext: djContext || state.djContext,
      }
    }),

  playPlaylist: (playlist, track, djContext) =>
    set((state) => {
      console.log('play playlist', playlist, track)
      return {
        playlist,
        track,
        djContext: djContext || state.djContext,
      }
    }),

  isPlaying: (params) => {
    const state = get()
    if (!state.djContext || !state.track) return false

    params.djContext ||= state.djContext
    if (state.djContext.path != params.djContext.path) return false

    if (params.playlist) {
      if (!state.playlist) return false
      const isPlayingPlaylist = state.playlist.id == params.playlist.id
      if (params.track) {
        return isPlayingPlaylist && params.track.id == state.track.id
      }
      return isPlayingPlaylist
    }

    if (params.track) {
      return !state.playlist && params.track.id == state.track.id
    }

    return false
  },

  advance: (direction: number) =>
    set(({ track, playlist, djContext: djContext }) => {
      if (!djContext) {
        throw new Error(`no dj context`)
      }
      if (!track) {
        throw new Error(`can't advance: no current track`)
      }

      let currentIdx = -1

      // find current item
      if (playlist) {
        currentIdx = djContext.items.findIndex(
          (q) => q.type == 'playlist' && q.id == playlist.id
        )
      } else {
        currentIdx = djContext.items.findIndex(
          (q) => q.type == 'track' && q.id == track.id
        )
      }

      console.log({
        task: 'advance',
        currentIdx,
        playlist,
        track,
      })

      // if playlist find next track in playlist
      if (playlist) {
        const playlistIdx = playlist.tracks.findIndex((t) => t.id == track!.id)
        const next = playlist.tracks[playlistIdx + direction]
        console.log('playlist next', playlist.id, playlistIdx)
        if (next) return { playlist, track: next }
      }

      const next = djContext.items[currentIdx + direction]
      if (!next) {
        console.log(`todo: find some music to play`)
        return { playlist: undefined, track: undefined }
      } else if (next?.type == 'playlist') {
        return { playlist: next, track: next.tracks[0] }
      } else if (next) {
        return { playlist: undefined, track: next }
      }

      throw new Error(`unreachable`)
    }),
}))
