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
          // queryClient sets x-my-handle
          // which might not be included in the queryKey
          // so clear all caches here...
          queryClient.clear()
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
