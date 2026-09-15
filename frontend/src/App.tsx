import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { BgmProvider } from './components/Bgm'
import { ToastProvider } from './components/Toast'
import { router } from './routes/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BgmProvider>
          <RouterProvider router={router} />
        </BgmProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
