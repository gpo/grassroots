import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { OrganizationsDTO } from "grassroots-shared/dtos/Organization.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function useOrganizations(): UseQueryResult<OrganizationsDTO> {
  return useQuery<OrganizationsDTO>({
    queryKey: ["organizations"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/organizations", {});
      return OrganizationsDTO.fromFetchOrThrow(result);
    },
  });
}
