'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('/api/projects', fetcher)
  return {
    projects: data?.projects ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useProject(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/projects/${id}` : null,
    fetcher
  )
  return {
    project: data?.project ?? null,
    isLoading,
    isError: !!error,
    mutate,
  }
}
