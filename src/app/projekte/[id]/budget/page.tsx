import { BudgetListe } from '@/components/budget/BudgetListe'

export default function BudgetPage({ params }: { params: { id: string } }) {
  return <BudgetListe projectId={params.id} />
}
