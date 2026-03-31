'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAufgaben(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/tasks` : null,
    fetcher
  )
  return {
    tasks: data?.tasks ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
