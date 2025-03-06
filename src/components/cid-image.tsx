import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const CONTENT_NODE = 'https://creatornode2.audius.co'
// let FRONTEND = 'https://audius.co'

// if (process.env.ENV == 'stage') {
//   CONTENT_NODE = 'https://creatornode10.staging.audius.co'
//   // FRONTEND = 'https://staging.audius.co'
// }

/*
150x150
480x480
1000x1000

640x
2000x
*/

type CidImageProps = ComponentProps<'button'> & {
  img?: string
  size?: number
  className?: string
}

export function CidImage({ img, size, className, ...props }: CidImageProps) {
  size ||= 90

  let version = '150x150'
  if (size > 150) {
    version = '480x480'
  }

  const e = img ? (
    <img
      loading="lazy"
      decoding="async"
      src={`${CONTENT_NODE}/content/${img}/${version}.jpg`}
      width={size}
      height={size}
    />
  ) : (
    <div
      className="bg-secondary"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
      }}
    ></div>
  )
  return (
    <button
      style={{ width: size, height: size }}
      className={cn('rounded-md overflow-clip', className)}
      {...props}
    >
      {e}
    </button>
  )
}
