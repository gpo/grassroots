import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { UsersDTO } from "@grassroots/shared";
import { useQuery } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI";
import { UserRow } from "../components/UserRow";

export const Route = createFileRoute("/Users")({
  component: Users,
});

function Users(): JSX.Element {
  const { data: users } = useQuery<UsersDTO>({
    queryKey: ["users"],
    initialData: UsersDTO.from({ users: [] }),
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/users", {});
      return UsersDTO.fromFetchOrThrow(result);
    },
  });
  return <div>{users.users.map((x) => UserRow({ user: x }))}</div>;
}
