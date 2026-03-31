'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useLinks(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/links` : null,
    fetcher
  )
  return {
    links: data?.links ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
