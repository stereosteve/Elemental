import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

type MeStore = {
  myId?: number
  become: (myId?: number) => void
}

export const meStore = createStore<MeStore>()(
  persist(
    (set) => {
      return {
        become: (myId) => set({ myId }),
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

// export const useMe = (selector?: any) => useStore(meStore, selector)

// export const useMe = create<MeStore>()(
//   persist(
//     (set, get) => ({
//       become: (myId) => set({ myId }),
//     }),
//     {
//       name: 'me-storage',
//     }
//   )
// )
