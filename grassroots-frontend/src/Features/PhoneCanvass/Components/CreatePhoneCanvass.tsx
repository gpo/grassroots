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
      if (values.audio === undefined) {
        Object.assign(errors, { audio: "Missing voicemail" });
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
  // This appears to be the only way to cause a rerender in a FileInput when you
  // clear the field.
  const [keyAppendixToForceRerender, setKeyAppendixToForceRerender] =
    useState(0);

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
      console.log("SETTING FILE TO ", file);
      if (uploadedAudio) {
        URL.revokeObjectURL(uploadedAudio.url);
      }
      if (!file) {
        setUploadedAudio(null);
        return;
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
      console.log("SET FIELD VALUE TO ", file);
    },
    [uploadedAudio, form],
  );

  return (
    <>
      <Title order={2}>Create a Phone Canvass</Title>

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
            clearable
            key={form.key("audio") + String(keyAppendixToForceRerender)}
            {...form.getInputProps("audio")}
            onChange={(file: File | null) => {
              console.log("In form, file is", file);
              console.log(typeof file);
              handleAudioChange(file);
              if (file !== null) {
                return;
              }
              form.setFieldValue("audio", undefined);
              setKeyAppendixToForceRerender((v) => v + 1);
            }}
          ></FileInput>
          {/* TODO: maybe this should take up space before an upload occurs, to avoid
           content jumping around. */}
          {uploadedAudio && <AudioPreview audioFile={uploadedAudio} />}
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </>
  );
}
