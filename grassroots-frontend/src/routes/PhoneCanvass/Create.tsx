import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JSX, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { readFileAsText } from "../../util/ReadFileAsText.js";
import {
  CreatePhoneCanvassDataValidatedDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { classValidatorResolver } from "../../util/ClassValidatorResolver.js";
import { FileInput, TextInput } from "@mantine/core";
import { useTypedForm } from "../../util/UseTypedForm.js";
import { FieldErrors } from "react-hook-form";
import { AudioFile, AudioPreview } from "../../components/AudioPreview.js";

export const Route = createFileRoute("/PhoneCanvass/Create")({
  component: CreatePhoneCanvass,
});

class CreatePhoneCanvassData extends CreatePhoneCanvassDataValidatedDTO {
  csv!: File | undefined;
  audio!: File | undefined;
}

function CreatePhoneCanvass(): JSX.Element {
  const navigate = useNavigate();

  const form = useTypedForm<CreatePhoneCanvassData>({
    validate: classValidatorResolver(CreatePhoneCanvassData, (values) => {
      const errors: FieldErrors = {};
      if (values.csv === undefined) {
        Object.assign(errors, { csv: "Missing csv" });
      }
      return {};
    }),
    initialValues: CreatePhoneCanvassData.from({
      csv: undefined,
      name: "",
      audio: undefined,
    }),
  });

  const [uploadedAudio, setUploadedAudio] = useState<AudioFile | null>(null);

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

  const onSubmit = useCallback(async (data: CreatePhoneCanvassData) => {
    if (!data.csv) {
      throw new Error("Form submitted without csv present.");
    }

    const result = await mutateAsync(data);
    await navigate({
      to: "/PhoneCanvass/Manage/$phoneCanvassId",
      params: { phoneCanvassId: result.id },
    });
  }, []);

  const handleAudioChange = useCallback(
    (file: File | null) => {
      if (!file) {
        setUploadedAudio(null);
        return;
      }

      if (uploadedAudio) {
        URL.revokeObjectURL(uploadedAudio.url);
      }

      const audioFile: AudioFile = {
        id: Date.now().toString(),
        blob: file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedAudio(audioFile);
      form.setFieldValue("audio", file);
    },
    [uploadedAudio, form],
  );

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        label="Phone Canvass Name"
        key={form.key("name")}
        {...form.getInputProps("name")}
      ></TextInput>
      <FileInput
        label="Contact List CSV"
        description="CSV from GVote containing list of people to phone"
        placeholder="Contact List CSV"
        accept=".csv"
        key={form.key("csv")}
        {...form.getInputProps("csv")}
      ></FileInput>
      <FileInput
        label="Audio Uplaod"
        description="Audio file to play"
        placeholder="Audio File"
        accept="audio/*"
        key={form.key("audio")}
        onChange={handleAudioChange}
      ></FileInput>
      {uploadedAudio && (
        <AudioPreview
          audioFile={uploadedAudio}
          onRemove={() => {
            URL.revokeObjectURL(uploadedAudio.url);
            setUploadedAudio(null);
            form.setFieldValue("audio", undefined);
          }}
        />
      )}
      <input type="submit" />
    </form>
  );
}
