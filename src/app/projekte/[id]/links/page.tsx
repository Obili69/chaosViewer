import { LinkListe } from '@/components/links/LinkListe'

export default function LinksPage({ params }: { params: { id: string } }) {
  return <LinkListe projectId={params.id} />
}
