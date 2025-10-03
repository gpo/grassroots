import { UseQueryResult, useQuery } from "@tanstack/react-query";
import {
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../GrassRootsAPI.js";

export function usePhoneCanvassContactList(
  request: PaginatedPhoneCanvassContactListRequestDTO,
): UseQueryResult<PaginatedPhoneCanvassContactResponseDTO> {
  return useQuery<PaginatedPhoneCanvassContactResponseDTO>({
    queryKey: ["canvass"],
    staleTime: 60 * 1000,
    retry: 1,
    // If the user hits the next button, keep showing the prior data until new data is ready.
    placeholderData: (priorData) =>
      priorData ?? PaginatedPhoneCanvassContactResponseDTO.empty(),
    queryFn: async () => {
      const result = await grassrootsAPI.POST("/phone-canvass/list", {
        body: request,
      });
      return PaginatedPhoneCanvassContactResponseDTO.fromFetchOrThrow(result);
    },
  });
}
