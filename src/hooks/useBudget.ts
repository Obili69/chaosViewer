'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useBudget(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/budget` : null,
    fetcher
  )
  return {
    items: data?.items ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
