import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PhoneCanvassDetailsDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function usePhoneCanvassDetails(
  id: string,
): UseQueryResult<PhoneCanvassDetailsDTO> {
  return useQuery<PhoneCanvassDetailsDTO>({
    queryKey: ["canvass", id],
    staleTime: 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const result = await grassrootsAPI.GET("/phone-canvass/details/{id}", {
        params: { path: { id } },
      });
      return PhoneCanvassDetailsDTO.fromFetchOrThrow(result);
    },
  });
}
