import {
  PhoneCanvassContactDTO,
  UpdatePhoneCanvassContactNotesDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { JSX, useCallback } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { Button, Paper, Stack, Textarea } from "@mantine/core";

interface EditContactNotesProps {
  id: string;
  notes: string;
  style?: React.CSSProperties;
}

function useUpdateCallerNotesMutation(): UseMutationResult<
  PhoneCanvassContactDTO,
  Error,
  UpdatePhoneCanvassContactNotesDTO
> {
  return useMutation({
    mutationFn: async (params: UpdatePhoneCanvassContactNotesDTO) => {
      return PhoneCanvassContactDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/update-contact-notes", {
          body: params,
        }),
      );
    },
    retry: 1,
  });
}

export function EditContactNotes(params: EditContactNotesProps): JSX.Element {
  const updateNotes = useUpdateCallerNotesMutation();

  const form = useTypedForm<UpdatePhoneCanvassContactNotesDTO>({
    validate: classValidatorResolver(UpdatePhoneCanvassContactNotesDTO),
  });

  const onSubmit = useCallback(
    async (data: UpdatePhoneCanvassContactNotesDTO): Promise<void> => {
      await updateNotes.mutateAsync(data);
    },
    [],
  );

  return (
    <Paper style={params.style} shadow="sm" p="xl" radius="md" withBorder>
      <form style={{ height: "100%" }} onSubmit={form.onSubmit(onSubmit)}>
        <Stack h="100%">
          <Textarea
            h="100%"
            label="Notes"
            styles={{
              wrapper: { height: "100%" },
              input: { height: "100%" },
            }}
          ></Textarea>
          <Button mt="xl">Save</Button>
        </Stack>
      </form>
    </Paper>
  );
}
