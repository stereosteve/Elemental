import { FeedStub } from '@/types/feed-stub'
import { queryUsers } from './query-users'
import { queryTracks } from './query-tracks'
import { queryPlaylists } from './query-playlists'

type Args = {
  stubs: FeedStub[]
  myId?: number
}

export async function populateStubs({ stubs, myId }: Args) {
  const actorIds = stubs.map((s) => s.actorId).filter(Boolean)

  const trackIds = stubs.filter((s) => s.objType == 'track').map((s) => s.objId)

  const playlistIds = stubs
    .filter((s) => s.objType != 'track')
    .map((s) => s.objId)

  const [actors, tracks, playlists] = await Promise.all([
    queryUsers({ ids: actorIds, myId }),
    queryTracks({ ids: trackIds, myId }),
    queryPlaylists({ ids: playlistIds, myId }),
  ])

  for (const stub of stubs) {
    stub.actor = actors.find((a) => a.id == stub.actorId)
    if (stub.objType == 'track') {
      stub.track = tracks.find((t) => t.id == stub.objId)
    } else {
      stub.playlist = playlists.find((p) => p.id == stub.objId)
    }
  }

  return stubs.filter((s) => s.track || s.playlist)
}
