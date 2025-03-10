import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { useMe } from '@/state/me'

const someHandles = ['stereosteve', 'isaacsolo', 'rayjacobson']

export function LoginModal() {
  const { myHandle, become } = useMe()
  const [open, setOpen] = useState(false)
  const [handle, setHandle] = useState('')

  function login(handle: string) {
    console.log('hello', handle)
    become(handle)
    setOpen(false)
  }

  if (myHandle) {
    return (
      <Button variant="destructive" onClick={() => become()}>
        Log Out
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Log In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log In</DialogTitle>
          <DialogDescription>Enter handle to become a user.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            login(handle)
          }}
        >
          <div className="mb-4">
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="handle"
            />
          </div>
          <div>
            <Button type="submit">Log In</Button>
          </div>
        </form>
        <div>
          <div className="my-4">Or try an account:</div>
          {someHandles.map((h) => (
            <Button
              variant="ghost"
              key={h}
              type="button"
              onClick={() => login(h)}
            >
              {h}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
