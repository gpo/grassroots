import { faker } from "@faker-js/faker";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

function getRandomContact(orgIds: number[]): CreateContactRequestDTO {
  // Generating valid phone numbers is tough, so we restrict the possible values.
  const phoneNumber =
    "226-" +
    String(faker.number.int({ min: 200, max: 999 })) +
    "-" +
    String(faker.number.int({ min: 0, max: 9999 })).padStart(4, "0");

  const orgId = orgIds[Math.floor(Math.random() * orgIds.length)];
  if (orgId === undefined) {
    throw new Error("Missing organization ids");
  }
  return CreateContactRequestDTO.from({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber,
    organizationId: orgId,
  });
}

export function useAddFakeContacts(): UseMutationResult<
  {
    ids: number[];
  },
  Error,
  number[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgIds: number[]) => {
      const contacts = [];

      for (let i = 0; i < 100; ++i) {
        contacts.push(getRandomContact(orgIds));
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
}
