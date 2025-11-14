import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf, PropsOf } from "grassroots-shared/util/TypeUtils";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

export type RefreshCaller = UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  PhoneCanvassCallerDTO
>;

export interface PhoneCanvassCallerStore {
  // The persist middleware doesn't preserve the prototype chain, so
  // we store the props, and set up the prototype chain when we need it.
  callerProps?: PropsOf<PhoneCanvassCallerDTO> | undefined;
  setCaller: (caller: PhoneCanvassCallerDTO) => void;
  reset: () => void;
}

export const usePhoneCanvassCallerStore = create<PhoneCanvassCallerStore>()(
  devtools(
    persist(
      (set) => {
        return {
          callerProps: undefined,
          setCaller: (caller: PhoneCanvassCallerDTO): void => {
            set({ callerProps: { ...propsOf(caller) } });
          },
          reset: (): void => {
            set({ callerProps: undefined });
            usePhoneCanvassCallerStore.persist.clearStorage();
          },
        };
      },
      {
        name: "phonecanvass-caller-store",
      },
    ),
  ),
);

// Needs to be able to refresh a caller in case the authToken has expired.
export async function getPhoneCanvassCaller(params: {
  refreshCaller: RefreshCaller;
  activePhoneCanvassId: string;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
}): Promise<PhoneCanvassCallerDTO | undefined> {
  const { refreshCaller, activePhoneCanvassId, phoneCanvassCallerStore } =
    params;
  const props = phoneCanvassCallerStore.callerProps;
  if (props === undefined) {
    return undefined;
  }

  // We have a caller, but not for this canvass.
  // Clear the existing caller, and return undefined.
  if (props.activePhoneCanvassId !== activePhoneCanvassId) {
    phoneCanvassCallerStore.reset();
    return undefined;
  }

  // If the auth token has expired, we need to refresh it.
  const { exp } = jwtDecode<{ exp: number }>(props.authToken);
  if (exp * 1000 - Date.now() < 0) {
    const refreshed = await refreshCaller(PhoneCanvassCallerDTO.from(props));
    phoneCanvassCallerStore.setCaller(refreshed);
    return refreshed;
  }

  return PhoneCanvassCallerDTO.from(props);
}
