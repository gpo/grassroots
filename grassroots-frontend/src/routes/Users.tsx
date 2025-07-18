import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { UserDTO } from "../grassroots-shared/User.dto";
import { useQuery } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI";
import { UserRow } from "../components/UserRow";

export const Route = createFileRoute("/Users")({
  component: Users,
});

function Users(): JSX.Element {
  const { data: results } = useQuery<UserDTO[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/users", {});
      return result.data ?? [];
    },
  });
  const users = results ?? [];
  return <div>{users.map((x) => UserRow({ user: x }))}</div>;
}
