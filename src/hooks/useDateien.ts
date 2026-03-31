'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useDateien(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/files` : null,
    fetcher
  )
  return {
    files: data?.files ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
