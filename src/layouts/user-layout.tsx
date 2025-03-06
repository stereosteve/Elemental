import { UserRow } from '@/types/user-row'
import clsx from 'clsx'
import React from 'react'
import { Link } from 'react-router'

interface UserLayoutProps {
  user: UserRow
  container?: boolean
  children: React.ReactNode
}

const UserLayout: React.FC<UserLayoutProps> = ({
  user,
  container,
  children,
}) => {
  return (
    <div className="user-layout">
      <div className="text-xl bg-blue-100 p-2">{user.name}</div>
      <div className="flex gap-2">
        <Link to={`/${user.handle}`}>Tracks</Link>
        <Link to={`/${user.handle}/playlists`}>Playlists</Link>
        <Link to={`/${user.handle}/reposts`}>Reposts</Link>
        <Link to={`/${user.handle}/comments`}>Comments</Link>
      </div>

      <div className={clsx(container && 'container mx-auto')}>{children}</div>
    </div>
  )
}

export default UserLayout
