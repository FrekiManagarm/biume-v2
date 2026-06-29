import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/agenda')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/agenda"!</div>
}
