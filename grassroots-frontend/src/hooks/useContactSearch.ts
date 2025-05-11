import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  PaginatedContactOutDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { grassrootsAPI } from "../grassRootsAPI";

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
      const contact = searchParams.contact;
      // If all fields are blank, instead of returning all results, we'll return no results.
      if (
        Object.values(contact).every(
          (el: unknown) => el === undefined || el === "",
        )
      ) {
        return PaginatedContactOutDTO.empty();
      }
      const result = await grassrootsAPI.POST("/contacts/search", {
        body: searchParams,
      });
      return result.data ?? PaginatedContactOutDTO.empty();
    },
  });
}
