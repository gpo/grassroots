import { createFileRoute } from "@tanstack/react-router";
import { OrganizersPage } from "../areas/organizers/OrganizersPage";

export const Route = createFileRoute("/Organizers")({
  component: OrganizersPage,
});
