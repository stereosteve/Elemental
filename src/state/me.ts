import { queryClient } from '@/client'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

type MeStore = {
  myHandle?: string
  become: (myHandle?: string) => void
}

export const meStore = createStore<MeStore>()(
  persist(
    (set) => {
      return {
        become: (myHandle) => {
          set({ myHandle })
          queryClient.invalidateQueries()
        },
      }
    },
    {
      name: 'me-storage',
    }
  )
)

export function useMe(): MeStore
export function useMe<T>(selector: (state: MeStore) => T): T
export function useMe<T>(selector?: (state: MeStore) => T) {
  return useStore(meStore, selector!)
}
