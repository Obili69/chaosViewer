'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useVersionen(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/versions` : null,
    fetcher
  )
  return {
    versions: data?.versions ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
