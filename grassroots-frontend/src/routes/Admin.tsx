import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "../components/admin/AdminPage";

export const Route = createFileRoute("/Admin")({
  component: AdminPage,
});
