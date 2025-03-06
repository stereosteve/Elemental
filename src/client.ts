import { QueryClient } from '@tanstack/react-query'
// import { meStore } from './state/me'

// probably some middleware can add myId to cache key... and header
// for now we'll just try re-fetch all when myId changes in meStore
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const u = queryKey[0] as string
        // const { myId } = meStore.getState()
        // console.log(u, { myId })
        const resp = await fetch(u, {
          // headers: {
          //   'x-my-id': `${myId}`,
          // },
        })
        if (resp.ok) {
          return resp.json()
        }
        console.error(u, resp.status, await resp.text())
      },
      staleTime: 5000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
})

export async function simpleFetch(u: string) {
  // const { myId } = meStore.getState()
  const myId = 'todo'
  return queryClient.fetchQuery({
    queryKey: [u, myId],
    // queryFn: async () => {
    //   return fetch(u).then((r) => r.json())
    // },
  })
}
