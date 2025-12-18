import {
  PhoneCanvassContactDTO,
  UpdatePhoneCanvassContactNotesDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { JSX, useCallback, useState } from "react";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { Button, Stack, Textarea } from "@mantine/core";
import { IconCheck, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

interface EditContactNotesProps {
  contactId: number;
  phoneCanvassId: string;
  initialNotes: string;
}

function useUpdateCallerNotesMutation(): UseMutationResult<
  PhoneCanvassContactDTO,
  Error,
  UpdatePhoneCanvassContactNotesDTO
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePhoneCanvassContactNotesDTO) => {
      return PhoneCanvassContactDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/update-contact-notes", {
          body: params,
        }),
      );
    },
    // TODO: clean up these query keys.
    onSuccess: async (contact: PhoneCanvassContactDTO) => {
      await queryClient.invalidateQueries({
        queryKey: ["phone-canvass-contact-by-raw-id", contact.contact.id],
      });
    },
    retry: 1,
  });
}

type SaveState = "idle" | "saving" | "saved";

const getButtonIcon = (saveState: SaveState): JSX.Element => {
  switch (saveState) {
    case "idle":
      return <IconDeviceFloppy size={16} />;
    case "saving":
      return <IconLoader2 size={16} className="animate-spin" />;
    case "saved":
      return <IconCheck size={16} />;
  }
};

const getButtonLabel = (saveState: SaveState): string => {
  switch (saveState) {
    case "idle":
      return "Save";
    case "saving":
      return "Saving...";
    case "saved":
      return "Saved!";
  }
};

export function EditContactNotes(params: EditContactNotesProps): JSX.Element {
  const updateNotes = useUpdateCallerNotesMutation();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveStateTimeout, setSaveStateTimeout] = useState<number | undefined>(
    undefined,
  );

  const form = useTypedForm<UpdatePhoneCanvassContactNotesDTO>({
    validate: classValidatorResolver(UpdatePhoneCanvassContactNotesDTO),
    initialValues: UpdatePhoneCanvassContactNotesDTO.from({
      contactId: params.contactId,
      phoneCanvassId: params.phoneCanvassId,
      notes: params.initialNotes,
    }),
  });

  const onSubmit = useCallback(
    async (data: UpdatePhoneCanvassContactNotesDTO): Promise<void> => {
      if (saveStateTimeout !== undefined) {
        window.clearTimeout(saveStateTimeout);
      }
      setSaveState("saving");
      await updateNotes.mutateAsync(data);
      setSaveState("saved");
      setSaveStateTimeout(
        window.setTimeout(() => {
          setSaveState("idle");
        }, 2000),
      );
    },
    [],
  );
  return (
    <form style={{ flex: 1 }} onSubmit={form.onSubmit(onSubmit)}>
      <Stack h="100%">
        <Textarea
          key={form.key("notes")}
          flex="1"
          {...form.getInputProps("notes")}
          label="Notes"
          styles={{
            wrapper: { height: "100%" },
            input: { height: "100%" },
          }}
        ></Textarea>
        <Button type="submit" mt="lg" leftSection={getButtonIcon(saveState)}>
          {getButtonLabel(saveState)}
        </Button>
      </Stack>
    </form>
  );
}
