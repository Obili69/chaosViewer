import { ZeitListe } from '@/components/zeit/ZeitListe'

export default function ZeitPage({ params }: { params: { id: string } }) {
  return <ZeitListe projectId={params.id} />
}
