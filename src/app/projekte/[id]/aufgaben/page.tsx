import { AufgabenListe } from '@/components/aufgaben/AufgabenListe'

export default function AufgabenPage({ params }: { params: { id: string } }) {
  return <AufgabenListe projectId={params.id} />
}
