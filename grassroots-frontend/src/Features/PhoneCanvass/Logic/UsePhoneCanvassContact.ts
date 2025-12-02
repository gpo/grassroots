import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PhoneCanvassContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function usePhoneCanvassContact(params: {
  id: number | undefined;
  phoneCanvassId: string;
}): UseQueryResult<PhoneCanvassContactDTO> {
  const { id, phoneCanvassId } = params;
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
      const result = await grassrootsAPI.GET(
        "/phone-canvass/contact/{phoneCanvassId}/{id}",
        {
          params: { path: { id, phoneCanvassId } },
        },
      );
      return PhoneCanvassContactDTO.fromFetchOrThrow(result);
    },
  });
}
