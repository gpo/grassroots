import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function useAuthToken(phoneCanvassId: string): UseQueryResult<string> {
  return useQuery<string>({
    queryKey: ["authtoken", phoneCanvassId],
    queryFn: async () => {
      const { token } = PhoneCanvassAuthTokenResponseDTO.fromFetchOrThrow(
        await grassrootsAPI.GET("/phone-canvass/auth-token/{id}", {
          params: {
            path: {
              id: phoneCanvassId,
            },
          },
        }),
      );
      return token;
    },
  });
}
