// eslint-disable-next-line check-file/no-index, check-file/filename-naming-convention
import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { UsersDTO } from "grassroots-shared/dtos/User.dto";
import { useQuery } from "@tanstack/react-query";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { UserRow } from "../../Features/Users/Components/UserRow.js";

export const Route = createFileRoute("/Users/")({
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
