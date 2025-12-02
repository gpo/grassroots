import { UpdatePhoneCanvassContactNotesDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { useCallback } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

interface EditContactNotesProps {
  id: string;
  notes: string;
}

export function useUpdateCallerNotesMutation(): UseMutationResult<
  Record<string, never>,
  Error,
  string
> {
  return useMutation({
    mutationFn: async (phoneCanvassId: string, notes: string) => {
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

export function EditContactNotes() {
  const form = useTypedForm<UpdatePhoneCanvassContactNotesDTO>({
    validate: classValidatorResolver(UpdatePhoneCanvassContactNotesDTO),
    initialValues: UpdatePhoneCanvassContactNotesDTO.from({
      id: "",
      notes: "",
    }),
  });

  const onSubmit = useCallback(
    async (data: UpdatePhoneCanvassContactNotesDTO) => {},
    [],
  );
}
