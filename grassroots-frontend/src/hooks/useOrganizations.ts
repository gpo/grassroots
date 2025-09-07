import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI";
import { OrganizationsDTO } from "../grassroots-shared/Organization.dto";

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
