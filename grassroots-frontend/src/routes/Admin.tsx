import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../areas/admin/AdminPage";

export const Route = createFileRoute("/Admin")({
  component: AdminPage,
});
