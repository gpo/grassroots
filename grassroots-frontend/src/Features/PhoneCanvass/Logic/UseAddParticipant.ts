import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { PhoneCanvassIdentityStore } from "./PhoneCanvassIdentityStore.js";

export interface UseAddParticipantParams {
  phoneCanvassId: string;
  phoneCanvassIdentityStore: PhoneCanvassIdentityStore;
}

export function useAddParticipant(
  params: UseAddParticipantParams,
): UseMutateAsyncFunction<
  PhoneCanvassParticipantIdentityDTO,
  Error,
  PhoneCanvassParticipantIdentityDTO
> {
  const queryClient = useQueryClient();
  const { phoneCanvassId, phoneCanvassIdentityStore } = params;
  const { mutateAsync } = useMutation({
    mutationFn: async (identity: PhoneCanvassParticipantIdentityDTO) => {
      return PhoneCanvassParticipantIdentityDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/add-participant", {
          body: identity,
        }),
      );
    },
    retry: 1,
    onSuccess: async (setId: PhoneCanvassParticipantIdentityDTO) => {
      console.log("SETTING IDENTITY");
      phoneCanvassIdentityStore.setParticipantIdentity(
        PhoneCanvassParticipantIdentityDTO.from({
          displayName: setId.displayName,
          email: setId.email,
          activePhoneCanvassId: phoneCanvassId,
          ready: false,
        }),
      );
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });

  return mutateAsync;
}
