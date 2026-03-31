import { VersionsListe } from '@/components/versionen/VersionsListe'

export default function VersionenPage({ params }: { params: { id: string } }) {
  return <VersionsListe projectId={params.id} />
}
