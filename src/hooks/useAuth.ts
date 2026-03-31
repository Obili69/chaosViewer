'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAuth() {
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
  })
  return {
    user: data?.user ?? null,
    isLoading,
    isError: !!error,
  }
}
