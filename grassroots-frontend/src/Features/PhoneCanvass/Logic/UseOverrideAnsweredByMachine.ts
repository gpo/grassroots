import { UseMutateAsyncFunction, useMutation } from "@tanstack/react-query";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";

import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export interface UseOverrideAnsweredByMachineParams {
  phoneCanvassId: string;
  contactId: number;
}

export type UpdateOverrideAnsweredByMachineMutation = UseMutateAsyncFunction<
  VoidDTO,
  Error,
  UseOverrideAnsweredByMachineParams
>;

export function useOverrideAnsweredByMachine(): UpdateOverrideAnsweredByMachineMutation {
  const { mutateAsync } = useMutation({
    mutationFn: async (override: UseOverrideAnsweredByMachineParams) => {
      return VoidDTO.fromFetchOrThrow(
        await grassrootsAPI.POST(
          "/phone-canvass/override-answered-by-machine",
          {
            body: {
              phoneCanvassId: override.phoneCanvassId,
              contactId: override.contactId,
            },
          },
        ),
      );
    },
    retry: 1,
  });

  return mutateAsync;
}
