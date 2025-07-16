import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI";
import {
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "../grassroots-shared/Contact.dto";

export function useContactSearch(
  searchParams: PaginatedContactSearchRequestDTO,
): DefinedUseQueryResult<PaginatedContactResponseDTO> {
  return useQuery<PaginatedContactResponseDTO>({
    queryKey: ["contacts", searchParams],
    staleTime: 60 * 1000,
    retry: 1,
    initialData: PaginatedContactResponseDTO.empty(),
    // If the user hits the next button, keep showing the prior data until new data is ready.
    placeholderData: (priorData) =>
      priorData ?? PaginatedContactResponseDTO.empty(),
    queryFn: async () => {
      const result = await grassrootsAPI.POST("/contacts/search", {
        body: searchParams,
      });
      return PaginatedContactResponseDTO.fromFetchOrThrow(result);
    },
  });
}
