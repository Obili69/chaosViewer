import { ProblemeListe } from '@/components/probleme/ProblemeListe'

export default function ProblemePage({ params }: { params: { id: string } }) {
  return <ProblemeListe projectId={params.id} />
}
