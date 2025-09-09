import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { UsersDTO } from "../grassroots-shared/User.dto.js";
import { useQuery } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI.js";
import { UserRow } from "../components/UserRow.js";

export const Route = createFileRoute("/Users")({
  component: Users,
});

function Users(): JSX.Element {
  const { data: users } = useQuery<UsersDTO>({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/users", {});
      return UsersDTO.fromFetchOrThrow(result);
    },
  });
  return <div>{(users?.users ?? []).map((x) => UserRow({ user: x }))}</div>;
}
