import { UseMutateAsyncFunction, useMutation } from "@tanstack/react-query";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";

import { grassrootsAPI } from "../../../GrassRootsAPI.js";

// TODO - refactor this with UseOverrideAnsweredByMachine.

export interface UseHangupParams {
  phoneCanvassId: string;
  contactId: number;
}

export type UpdateHangupMutation = UseMutateAsyncFunction<
  VoidDTO,
  Error,
  UseHangupParams
>;

export function useHangup(): UpdateHangupMutation {
  const { mutateAsync } = useMutation({
    mutationFn: async (override: UseHangupParams) => {
      return VoidDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/hangup", {
          body: {
            phoneCanvassId: override.phoneCanvassId,
            contactId: override.contactId,
          },
        }),
      );
    },
    retry: 1,
  });

  return mutateAsync;
}
