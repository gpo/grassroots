import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../pages/me/MyPage.js";

export const Route = createFileRoute("/Me")({
  component: MyPage,
});
