import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Home } from './routes/home'
import { UserHome } from './routes/user-home'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './client'
import { GlobalLayout } from './layouts/global-layout'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<h1>About</h1>} />

            <Route path=":handle">
              <Route index element={<UserHome />} />
              <Route path="reposts" element={<h1>User Reposts</h1>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
