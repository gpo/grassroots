import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { PhoneCanvassCallerStore } from "./PhoneCanvassCallerStore.js";

export interface UseRegisterCallerParams {
  phoneCanvassId: string;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
}

export function useRegisterCaller(
  params: UseRegisterCallerParams,
): UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  CreatePhoneCanvassCallerDTO
> {
  const queryClient = useQueryClient();
  const { phoneCanvassCallerStore } = params;
  const { mutateAsync } = useMutation({
    mutationFn: async (caller: CreatePhoneCanvassCallerDTO) => {
      return PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/register-caller", {
          body: caller,
        }),
      );
    },
    retry: 1,
    onSuccess: async (caller: PhoneCanvassCallerDTO) => {
      phoneCanvassCallerStore.setCaller(PhoneCanvassCallerDTO.from(caller));
      console.log(
        "SETTING AUTHTOKEN IN CREATE TO ",
        caller.authToken.slice(-10, -1),
      );
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });

  return mutateAsync;
}
