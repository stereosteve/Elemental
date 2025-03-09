import { QueryClient } from '@tanstack/react-query'
import { meStore } from './state/me'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        return simpleFetch(queryKey[0] as string)
      },
      staleTime: 5000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
})

export async function simpleFetch(u: string) {
  const { myHandle } = meStore.getState()
  console.log(u, { myHandle })
  const resp = await fetch(u, {
    headers: {
      'x-my-handle': `${myHandle}`,
    },
  })
  if (resp.ok) {
    return resp.json()
  }
  console.error(u, resp.status, await resp.text())
}
