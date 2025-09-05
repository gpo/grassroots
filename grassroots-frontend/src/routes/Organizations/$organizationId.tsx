import { createFileRoute } from "@tanstack/react-router";
import { OrganizationDashboard } from "../../pages/organizations/OrganizationPage";

export const Route = createFileRoute("/Organizations/$organizationId")({
  component: OrganizationDashboard,
});
