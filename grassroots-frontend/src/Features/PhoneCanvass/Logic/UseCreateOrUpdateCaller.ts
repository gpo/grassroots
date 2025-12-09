import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreateOrUpdatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { PhoneCanvassCallerStore } from "./PhoneCanvassCallerStore.js";

export interface UseCreateOrUpdateCallerParams {
  phoneCanvassId: string;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
  keepAlive?: boolean;
}

export type CreateOrUpdateCallerMutation = UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  CreateOrUpdatePhoneCanvassCallerDTO
>;

export function useCreateOrUpdateCallerMutation(
  params: UseCreateOrUpdateCallerParams,
): CreateOrUpdateCallerMutation {
  const queryClient = useQueryClient();
  const { phoneCanvassCallerStore } = params;
  const { mutateAsync } = useMutation({
    mutationFn: async (caller: CreateOrUpdatePhoneCanvassCallerDTO) => {
      return PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/create-or-update-caller", {
          body: caller,
          keepalive: params.keepAlive === true,
        }),
      );
    },
    retry: 1,
    onSuccess: async (caller: PhoneCanvassCallerDTO) => {
      phoneCanvassCallerStore.setCaller(PhoneCanvassCallerDTO.from(caller));
      await queryClient.invalidateQueries({ queryKey: ["caller"] });
    },
  });

  return mutateAsync;
}
