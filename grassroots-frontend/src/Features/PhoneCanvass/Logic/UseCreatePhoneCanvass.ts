import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CreatePhoneCanvassDataValidatedDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { readFileAsText } from "../../../Logic/Util/ReadFileAsText.js";

export class CreatePhoneCanvassData extends CreatePhoneCanvassDataValidatedDTO {
  csv!: File | undefined;
  audio!: File | undefined;
}

export function useCreatePhoneCanvass(): UseMutateAsyncFunction<
  CreatePhoneCanvassResponseDTO,
  Error,
  CreatePhoneCanvassData
> {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (phoneCanvass: CreatePhoneCanvassData) => {
      if (!phoneCanvass.csv) {
        throw new Error("Form submitted without csv present.");
      }
      const csvText = await readFileAsText(phoneCanvass.csv);

      return CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass", {
          body: {
            csv: csvText,
            name: phoneCanvass.name,
            // Note: audio field not yet sent to backend (will be implemented in PR #3)
          },
        }),
      );
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });
  return mutateAsync;
}
