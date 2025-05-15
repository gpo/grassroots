import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/Contact.entity.dto";
import { grassrootsAPI } from "../GrassRootsAPI";

export function useContactSearch(
  searchParams: PaginatedContactSearchInDTO,
): UseQueryResult<PaginatedContactOutDTO> {
  return useQuery<PaginatedContactOutDTO>({
    queryKey: ["contacts", searchParams],
    staleTime: 60 * 1000,
    retry: 1,
    // If the user hits the next button, keep showing the prior data until new data is ready.
    placeholderData: (priorData) => priorData ?? PaginatedContactOutDTO.empty(),
    queryFn: async () => {
      const result = await grassrootsAPI.POST("/contacts/search", {
        body: searchParams,
      });
      return result.data ?? PaginatedContactOutDTO.empty();
    },
  });
}
