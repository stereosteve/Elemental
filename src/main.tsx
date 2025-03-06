import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './routes/home'
import { UserHome } from './routes/user-home'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './client'
import { GlobalLayout } from './layouts/global-layout'
import { UserPlaylists } from './routes/user-playlists'
import UserReposts from './routes/user-reposts'
import ExploreGenres from './routes/explore-genres'
import Feed from './routes/feed'
import { UserComments } from './routes/user-comments'
import { TrackDetail } from './routes/track-detail'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<h1>About</h1>} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/explore/genres" element={<ExploreGenres />} />

            <Route path=":handle">
              <Route index element={<UserHome />} />
              <Route path="playlists" element={<UserPlaylists />} />
              <Route path="reposts" element={<UserReposts />} />
              <Route path="feed" element={<UserReposts />} />
              <Route path="comments" element={<UserComments />} />

              <Route path=":trackSlug/:trackId" element={<TrackDetail />} />
            </Route>

            <Route path="*" element={<h1>Not found...</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
