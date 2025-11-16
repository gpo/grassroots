import { TextInput, FileInput, Stack, Button, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { JSX, useState, useCallback } from "react";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { AudioFile, AudioPreview } from "./AudioPreview.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import {
  CreatePhoneCanvassData,
  useCreatePhoneCanvass,
} from "../Logic/UseCreatePhoneCanvass.js";
import { FormErrors } from "@mantine/form";

export function CreatePhoneCanvass(): JSX.Element {
  const navigate = useNavigate();

  const createPhoneCanvass = useCreatePhoneCanvass();

  const form = useTypedForm<CreatePhoneCanvassData>({
    validate: classValidatorResolver(CreatePhoneCanvassData, (values) => {
      const errors: FormErrors = {};
      if (values.csv === undefined) {
        Object.assign(errors, { csv: "Missing csv" });
      }
      return errors;
    }),
    initialValues: CreatePhoneCanvassData.from({
      csv: undefined,
      name: "",
      audio: undefined,
    }),
  });

  const [uploadedAudio, setUploadedAudio] = useState<AudioFile | null>(null);

  const onSubmit = useCallback(async (data: CreatePhoneCanvassData) => {
    if (!data.csv) {
      throw new Error("Form submitted without csv present.");
    }

    const result = await createPhoneCanvass(data);
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
    <>
      <Title>Create a Phone Canvass</Title>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
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
            label="Audio Upload"
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
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </>
  );
}
