import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { queryClient } from './client'
import { GlobalLayout } from './layouts/global-layout'
import UserLayout from './layouts/user-layout'
import ExploreGenres from './routes/explore-genres'
import Feed from './routes/feed'
import { Home } from './routes/home'
import { Hot } from './routes/hot'
import { TrackDetail } from './routes/track-detail'
import { UserComments } from './routes/user-comments'
import { UserHome } from './routes/user-home'
import { UserPlaylists } from './routes/user-playlists'
import UserReposts from './routes/user-reposts'
import { Library } from './routes/library'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<h1>About</h1>} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/hot" element={<Hot />} />
            <Route path="/library" element={<Library />} />
            <Route path="/explore/genres" element={<ExploreGenres />} />

            <Route path=":handle">
              <Route element={<UserLayout />}>
                <Route index element={<UserHome />} />
                <Route
                  path="playlists"
                  element={<UserPlaylists />}
                  id="Playlists"
                />
                <Route path="reposts" element={<UserReposts />} id="Reposts" />
                <Route path="feed" element={<UserReposts />} />
                <Route path="comments" element={<UserComments />} />
              </Route>

              <Route path=":trackSlug/:trackId" element={<TrackDetail />} />
            </Route>

            <Route path="*" element={<h1>Not found...</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
