import { Button } from "@mantine/core";
import { JSX } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI";
import { CreateContactRequestDto } from "../../grassroots-shared/Contact.dto";
import { faker } from "@faker-js/faker";

function getRandomContact(): CreateContactRequestDto {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
  };
}

async function populateFakeData(): Promise<void> {
  const contacts = [];

  for (let i = 0; i < 100; ++i) {
    contacts.push(getRandomContact());
  }
  await grassrootsAPI.POST("/contacts/bulk-create", {
    body: {
      contacts,
    },
  });
}

export function AddFakeDataButton(): JSX.Element {
  return (
    <Button
      onClick={
        void (async (): Promise<void> => {
          await populateFakeData();
        })
      }
    >
      Add 100 Random Contacts
    </Button>
  );
}
