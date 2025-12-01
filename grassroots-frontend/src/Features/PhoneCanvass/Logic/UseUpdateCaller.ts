import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { PhoneCanvassCallerStore } from "./PhoneCanvassCallerStore.js";

export interface UseRegisterCallerParams {
  phoneCanvassId: string;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
  keepAlive: boolean;
}

export type UpdateCallerMutation = UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  PhoneCanvassCallerDTO
>;

export function useUpdateCaller(
  params: UseRegisterCallerParams,
): UpdateCallerMutation {
  const queryClient = useQueryClient();
  const { phoneCanvassCallerStore } = params;
  const { mutateAsync } = useMutation({
    mutationFn: async (caller: PhoneCanvassCallerDTO) => {
      return PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/update-caller", {
          body: caller,
          keepalive: params.keepAlive,
        }),
      );
    },
    retry: 1,
    onSuccess: async (caller: PhoneCanvassCallerDTO) => {
      console.log("SETTING AUTHTOKEN TO ", caller.authToken.slice(-10, -1));
      phoneCanvassCallerStore.setCaller(PhoneCanvassCallerDTO.from(caller));
      await queryClient.invalidateQueries({ queryKey: ["caller"] });
    },
  });

  return mutateAsync;
}
