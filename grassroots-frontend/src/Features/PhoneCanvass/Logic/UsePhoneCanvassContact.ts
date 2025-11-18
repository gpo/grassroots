import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PhoneCanvassContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function usePhoneCanvassContact(
  id: number | undefined,
): UseQueryResult<PhoneCanvassContactDTO> {
  return useQuery<PhoneCanvassContactDTO>({
    // TODO: clean up these query keys.
    queryKey: ["phone-canvass-contact", id],
    staleTime: 60 * 1000,
    retry: 1,
    enabled: id !== undefined,
    queryFn: async () => {
      if (id === undefined) {
        throw new Error("Query should be disabled");
      }
      const result = await grassrootsAPI.GET("/phone-canvass/contact/{id}", {
        params: { path: { id } },
      });
      return PhoneCanvassContactDTO.fromFetchOrThrow(result);
    },
  });
}
