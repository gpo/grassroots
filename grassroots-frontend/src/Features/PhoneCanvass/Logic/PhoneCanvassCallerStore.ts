import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { propsOf, PropsOf } from "grassroots-shared/util/TypeUtils";
import { create, useStore } from "zustand";
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
  getCaller: (
    refreshCaller: RefreshCaller,
    activePhoneCanvassId: string,
  ) => Promise<PhoneCanvassCallerDTO | undefined>;
  setCaller: (id: PhoneCanvassCallerDTO) => void;
  reset: () => void;
}

export const usePhoneCanvassCaller = () => {
  usePhoneCanvassCallerStore((state) => state.callerProps);
};

export const usePhoneCanvassCallerStore = create<PhoneCanvassCallerStore>()(
  devtools(
    persist(
      (set, get) => {
        return {
          callerProps: undefined,
          // Needs to be able to refresh a caller in case the authToken has expired.
          async getCaller(
            refreshCaller: RefreshCaller,
            activePhoneCanvassId: string,
          ): Promise<PhoneCanvassCallerDTO | undefined> {
            console.log("GETTER is called");
            const props = get().callerProps;
            if (props === undefined) {
              return undefined;
            }

            if (props.activePhoneCanvassId !== activePhoneCanvassId) {
              set({ callerProps: undefined });
              usePhoneCanvassCallerStore.persist.clearStorage();
              return undefined;
            }

            // If the auth token has expired, we need to refresh it.
            const { exp } = jwtDecode<{ exp: number }>(props.authToken);
            if (exp * 1000 - Date.now() < 0) {
              const refreshed = await refreshCaller(
                PhoneCanvassCallerDTO.from(props),
              );
              set({ callerProps: propsOf(refreshed) });
              return refreshed;
            }

            return PhoneCanvassCallerDTO.from(props);
          },
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
