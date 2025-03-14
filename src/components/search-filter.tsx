import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type AggBucket = {
  key: string
  doc_count: number
}

type Props = {
  name: string
  open: boolean
  setOpen: (open: boolean) => void

  isFetching: boolean
  buckets: AggBucket[]

  value: string
  onChange: (value: string) => void
}

export function SearchFilter({
  name,
  open,
  setOpen,
  buckets,
  value,
  onChange,
  isFetching,
}: Props) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? value : name}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-96 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>
              {isFetching ? 'Loading' : 'Nothing doing'}
            </CommandEmpty>
            <CommandGroup>
              {buckets.map((b) => (
                <CommandItem
                  key={b.key}
                  value={b.key}
                  onSelect={() => {
                    onChange(b.key.toString())
                    setOpen(false)
                  }}
                  className="flex gap-2"
                >
                  <Check
                    className={cn(value == b.key ? 'opacity-100' : 'opacity-0')}
                  />
                  <div className="flex-1">{b.key}</div>

                  <div>{b.doc_count}</div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
