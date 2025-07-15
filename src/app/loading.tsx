import { LoadingState } from '@/components/ui/loading'
import { Main } from '@/components/layout'

export default function Loading() {
  return (
    <Main className="flex items-center justify-center py-24">
      <LoadingState message="Loading page..." />
    </Main>
  )
}
