'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useProbleme(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/issues` : null,
    fetcher
  )
  return {
    issues: data?.issues ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
