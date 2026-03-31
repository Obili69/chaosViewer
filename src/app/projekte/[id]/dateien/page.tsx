import { DateiListe } from '@/components/dateien/DateiListe'

export default function DateienPage({ params }: { params: { id: string } }) {
  return <DateiListe projectId={params.id} />
}
