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
      if (!phoneCanvass.audio) {
        throw new Error("Form submitted without audio present.");
      }
      const csvText = await readFileAsText(phoneCanvass.csv);

      const formData = new FormData();
      formData.append("name", phoneCanvass.name);
      formData.append("csv", csvText);
      formData.append("voiceMailAudioFile", phoneCanvass.audio);

      return CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass", {
          // @ts-expect-error - FormData isn't strongly typed.
          body: formData,
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
