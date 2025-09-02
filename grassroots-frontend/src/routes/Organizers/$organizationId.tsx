import { createFileRoute } from "@tanstack/react-router";
import { OrganizersOrganizationDashboard } from "../../pages/organizers/organizations/OrganizersOrganizationDashboard";

export const Route = createFileRoute("/Organizers/$organizationId")({
  component: OrganizersOrganizationDashboard,
});
