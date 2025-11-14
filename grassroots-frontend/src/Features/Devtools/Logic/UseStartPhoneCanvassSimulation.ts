import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

export function useStartPhoneCanvassSimulation(): UseMutationResult<
  Record<string, never>,
  Error,
  string
> {
  return useMutation({
    mutationFn: async (phoneCanvassId: string) => {
      const result = await grassrootsAPI.GET(
        "/phone-canvass/start-simulation/{id}",
        {
          params: {
            path: {
              id: phoneCanvassId,
            },
          },
        },
      );

      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }
      return result.data;
    },
    retry: 1,
    onSuccess: () => {
      // TODO(mvp) - maybe track state here?
    },
  });
}
