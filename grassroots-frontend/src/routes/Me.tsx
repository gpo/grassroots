import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../pages/me/MyPage";

export const Route = createFileRoute("/Me")({
  component: MyPage,
});
