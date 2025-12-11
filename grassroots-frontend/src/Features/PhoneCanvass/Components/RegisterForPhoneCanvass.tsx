import { JSX, useCallback } from "react";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import { Button, Stack, TextInput, Title } from "@mantine/core";
import { CreateOrUpdatePhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { useNavigate } from "@tanstack/react-router";
import { RegisterForPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/Register.$phoneCanvassId.js";
import { useCreateOrUpdateCallerMutation } from "../Logic/UseCreateOrUpdateCaller.js";

export function RegisterForPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = RegisterForPhoneCanvassRoute.useParams();
  const identityForm = useTypedForm<CreateOrUpdatePhoneCanvassCallerDTO>({
    validate: classValidatorResolver(CreateOrUpdatePhoneCanvassCallerDTO),
    initialValues: CreateOrUpdatePhoneCanvassCallerDTO.from({
      displayName: "",
      email: "",
      activePhoneCanvassId: phoneCanvassId,
    }),
  });
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();
  const navigate = useNavigate();

  const addCaller = useCreateOrUpdateCallerMutation({
    phoneCanvassId: phoneCanvassId,
    phoneCanvassCallerStore: phoneCanvassCallerStore,
  });

  const onSubmit = useCallback(
    async (data: CreateOrUpdatePhoneCanvassCallerDTO) => {
      await addCaller(data);
      await navigate({
        to: "/PhoneCanvass/$phoneCanvassId",
        params: { phoneCanvassId: phoneCanvassId },
      });
    },
    [],
  );

  return (
    <>
      <Title order={2}>Welcome!</Title>
      <form onSubmit={identityForm.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Display Name"
            key={identityForm.key("displayName")}
            {...identityForm.getInputProps("displayName")}
          ></TextInput>
          <TextInput
            label="Email"
            key={identityForm.key("email")}
            {...identityForm.getInputProps("email")}
          ></TextInput>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </>
  );
}
