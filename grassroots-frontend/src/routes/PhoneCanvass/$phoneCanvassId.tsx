import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback } from "react";
import { StartCall } from "../../components/phonecanvass/StartCall.js";
import { usePhoneCanvassParticipantStore } from "../../context/PhoneCanvassParticipantStore.js";
import { TextInput } from "@mantine/core";
import { useTypedForm } from "../../util/UseTypedForm.js";
import { classValidatorResolver } from "../../util/ClassValidatorResolver.js";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grassrootsAPI } from "../../GrassRootsAPI.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
});

const CALLEE_ID = 10;

function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = Route.useParams();
  const phoneCanvassParticipantStore = usePhoneCanvassParticipantStore();

  const identityForm = useTypedForm<PhoneCanvassParticipantIdentityDTO>({
    validate: classValidatorResolver(PhoneCanvassParticipantIdentityDTO),
    initialValues: PhoneCanvassParticipantIdentityDTO.from({
      displayName: "",
      email: "",
      activePhoneCanvassId: phoneCanvassId,
      ready: false,
    }),
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (identity: PhoneCanvassParticipantIdentityDTO) => {
      return PhoneCanvassParticipantIdentityDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/add-participant", {
          body: identity,
        }),
      );
    },
    retry: 1,
    onSuccess: async (setId: PhoneCanvassParticipantIdentityDTO) => {
      phoneCanvassParticipantStore.setParticipantIdentity(
        PhoneCanvassParticipantIdentityDTO.from({
          displayName: setId.displayName,
          email: setId.email,
          activePhoneCanvassId: phoneCanvassId,
          ready: false,
        }),
      );
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });

  const onSubmit = useCallback(
    async (data: PhoneCanvassParticipantIdentityDTO) => {
      await mutateAsync(data);
    },
    [],
  );

  if (
    phoneCanvassParticipantStore.identity === undefined ||
    phoneCanvassParticipantStore.identity.activePhoneCanvassId != phoneCanvassId
  ) {
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

  return (
    <>
      <h1> Call Party </h1>
      <h2> Welcome {phoneCanvassParticipantStore.identity.displayName}</h2>
      <StartCall
        callerIdentity={phoneCanvassParticipantStore.identity}
        calleeId={CALLEE_ID}
      ></StartCall>
    </>
  );
}
