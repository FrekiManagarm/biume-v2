import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/owners')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/owners"!</div>
}
