import { JSX, useCallback } from "react";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import { TextInput } from "@mantine/core";
import { CreatePhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { useRegisterCaller } from "../Logic/UseRegisterCaller.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { useNavigate } from "@tanstack/react-router";
import { RegisterForPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/Register.$phoneCanvassId.js";

export function RegisterForPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = RegisterForPhoneCanvassRoute.useParams();
  const identityForm = useTypedForm<CreatePhoneCanvassCallerDTO>({
    validate: classValidatorResolver(CreatePhoneCanvassCallerDTO),
    initialValues: CreatePhoneCanvassCallerDTO.from({
      displayName: "",
      email: "",
      activePhoneCanvassId: phoneCanvassId,
    }),
  });
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();
  const navigate = useNavigate();

  const addCaller = useRegisterCaller({
    phoneCanvassId: phoneCanvassId,
    phoneCanvassCallerStore: phoneCanvassCallerStore,
  });

  const onSubmit = useCallback(async (data: CreatePhoneCanvassCallerDTO) => {
    await addCaller(data);
    await navigate({
      to: "/PhoneCanvass/$phoneCanvassId",
      params: { phoneCanvassId: phoneCanvassId },
    });
  }, []);

  return (
    <>
      <h1>Welcome to the Party</h1>
      <form onSubmit={identityForm.onSubmit(onSubmit)}>
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
        <input type="submit" />
      </form>
    </>
  );
}
