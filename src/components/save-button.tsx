import { HeartIcon } from 'lucide-react'

type Props = {
  isSaved: boolean

  // todo: type + id
}

export function SaveButton({ isSaved }: Props) {
  return isSaved ? <HeartIcon fill="red" stroke="crimson" /> : <HeartIcon />
}
