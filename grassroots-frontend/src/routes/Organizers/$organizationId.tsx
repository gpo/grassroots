import { createFileRoute } from "@tanstack/react-router";
import { OrganizersOrganizationDashboard } from "../../areas/organizers/organizations/OrganizersOrganizationDashboard";

export const Route = createFileRoute("/Organizers/$organizationId")({
  component: OrganizersOrganizationDashboard,
});
