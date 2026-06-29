import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/reports_/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/reports_/$id/edit"!</div>
}
