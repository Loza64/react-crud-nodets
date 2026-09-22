import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
})

export const queryKeys = {
  // El SDK (sdk/core/AxiosConfig.ts) sigue usando esta key al limpiar la
  // caché en un 401; se conserva sin usarla en el resto de la app porque
  // ese archivo no debe modificarse.
  session: ['session'],
  products: ['products'],
  categories: ['categories'],
  photos: ['photos'],
}
