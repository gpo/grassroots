import { Button } from "@mantine/core";
import { JSX } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI";
import { CreateContactRequestDTO } from "grassroots-shared/Contact.dto";
import { faker } from "@faker-js/faker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TEMPORARY_FAKE_ORGANIZATION_ID } from "grassroots-shared/Organization.dto";

function getRandomContact(): CreateContactRequestDTO {
  // Generating valid phone numbers is tough, so we restrict the possible values.
  const phoneNumber =
    "226-" +
    String(faker.number.int({ min: 200, max: 999 })) +
    "-" +
    String(faker.number.int({ min: 0, max: 9999 })).padStart(4, "0");
  return CreateContactRequestDTO.from({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber,
    organizationId: TEMPORARY_FAKE_ORGANIZATION_ID,
  });
}

export function AddFakeDataButton(): JSX.Element {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      const contacts = [];

      for (let i = 0; i < 100; ++i) {
        contacts.push(getRandomContact());
      }
      const result = await grassrootsAPI.POST("/contacts/bulk-create", {
        body: {
          contacts,
        },
      });

      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }
      return result.data;
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  return (
    <Button
      onClick={() => {
        void mutateAsync();
      }}
    >
      Add 100 Random Contacts
    </Button>
  );
}
