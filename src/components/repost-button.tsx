import { Repeat2Icon } from 'lucide-react'

type Props = {
  isReposted: boolean

  // todo: type + id
}

export function RepostButton({ isReposted }: Props) {
  return isReposted ? <Repeat2Icon stroke="crimson" /> : <Repeat2Icon />
}
