import { FeedStub } from '@/types/feed-stub'
import { queryUsers } from './query-users'
import { queryTracks } from './query-tracks'
import { queryPlaylists } from './query-playlists'

type Args = {
  stubs: FeedStub[]
  myId?: number
}

export async function populateStubs({ stubs, myId }: Args) {
  const actorIds = stubs.map((s) => s.actor_id).filter(Boolean)

  const trackIds = stubs
    .filter((s) => s.obj_type == 'track')
    .map((s) => s.obj_id)

  const playlistIds = stubs
    .filter((s) => s.obj_type != 'track')
    .map((s) => s.obj_id)

  const [actors, tracks, playlists] = await Promise.all([
    queryUsers({ ids: actorIds, myId }),
    queryTracks({ ids: trackIds, myId }),
    queryPlaylists({ ids: playlistIds, myId }),
  ])

  for (const stub of stubs) {
    stub.actor = actors.find((a) => a.id == stub.actor_id)
    if (stub.obj_type == 'track') {
      stub.track = tracks.find((t) => t.id == stub.obj_id)
    } else {
      stub.playlist = playlists.find((p) => p.id == stub.obj_id)
    }
  }

  return stubs.filter((s) => s.track || s.playlist)
}
