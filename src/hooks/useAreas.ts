'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAreas(withProjects = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/areas${withProjects ? '?withProjects=true' : ''}`,
    fetcher
  )
  return {
    areas: data?.areas ?? [],
    ungrouped: data?.ungrouped ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
