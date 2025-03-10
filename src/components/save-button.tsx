import { HeartIcon } from 'lucide-react'
import colors from 'tailwindcss/colors'

type Props = {
  isSaved: boolean

  // todo: type + id
}

export function SaveButton({ isSaved }: Props) {
  return isSaved ? (
    <HeartIcon fill={colors.purple[500]} stroke={colors.purple[500]} />
  ) : (
    <HeartIcon />
  )
}
