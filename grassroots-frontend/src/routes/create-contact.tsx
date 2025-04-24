import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create-contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>TODO "/create-contact"!</div>
}
