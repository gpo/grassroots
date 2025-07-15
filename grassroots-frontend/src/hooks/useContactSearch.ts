import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { grassrootsAPI } from "../GrassRootsAPI";
import {
  ContactDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "../grassroots-shared/Contact.dto";
import { PaginatedResponseDTO } from "../grassroots-shared/Paginated.dto";

export function useContactSearch(
  searchParams: PaginatedContactSearchRequestDTO,
): UseQueryResult<PaginatedContactResponseDTO> {
  return useQuery<PaginatedContactResponseDTO>({
    queryKey: ["contacts", searchParams],
    staleTime: 60 * 1000,
    retry: 1,
    // If the user hits the next button, keep showing the prior data until new data is ready.
    placeholderData: (priorData) =>
      priorData ?? PaginatedContactResponseDTO.empty(),
    queryFn: async () => {
      const result = await grassrootsAPI.POST("/contacts/search", {
        body: searchParams,
      });
      if (result.data === undefined) {
        return PaginatedContactResponseDTO.empty();
      }
      return PaginatedContactResponseDTO.from({
        contacts: result.data.contacts.map((x) => ContactDTO.from(x)),
        paginated: PaginatedResponseDTO.from(result.data.paginated),
      });
    },
  });
}
