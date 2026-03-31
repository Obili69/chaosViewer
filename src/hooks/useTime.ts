import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useTime(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/projects/${projectId}/time` : null,
    fetcher
  )
  return {
    entries: data?.entries ?? [],
    totalSeconds: data?.totalSeconds ?? 0,
    tasks:  (data?.tasks  ?? []) as { id: string; title: string }[],
    issues: (data?.issues ?? []) as { id: string; title: string }[],
    isLoading,
    isError: !!error,
    mutate,
  }
}
