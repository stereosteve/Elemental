import { Repeat2Icon } from 'lucide-react'
import colors from 'tailwindcss/colors'

type Props = {
  isReposted: boolean

  // todo: type + id
}

export function RepostButton({ isReposted }: Props) {
  return isReposted ? (
    <Repeat2Icon stroke={colors.purple[500]} strokeWidth={3} />
  ) : (
    <Repeat2Icon />
  )
}
