import { Button } from "@mantine/core";
import { JSX } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { CreateContactRequestDTO } from "../../grassroots-shared/Contact.dto.js";
import { faker } from "@faker-js/faker";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { OrganizationsDTO } from "../../grassroots-shared/Organization.dto.js";
import { createOrganizationTree } from "../../grassroots-shared/devtools/CreateOrganizationTree.js";

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

function useAddFakeContacts(): UseMutationResult<
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

// Returns the list of organization details. An entry will be undefined if it wasn't successfully created, likely
// because it already existed.
function useAddFakeOrganizations(): UseMutationResult<
  | {
      id: number;
      name: string;
      parentId?: number;
    }[]
  | undefined,
  Error,
  void
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await createOrganizationTree(grassrootsAPI, {
          name: "Root Organization",
          children: [
            {
              name: "Green Party of Canada",
              children: [
                { name: "Saanich—Gulf Islands" },
                { name: "Kitchener Centre" },
                { name: "Guelph" },
                { name: "Fredricton" },
              ],
            },
            {
              name: "Green Party of Ontario",
              children: [
                { name: "Guelph Provincial" },
                { name: "Kitchener Centre Provincial" },
                { name: "Parry—Sound Muskoka" },
              ],
            },
            {
              name: "BC Greens",
              children: [
                { name: "Cowichan Valley" },
                { name: "Saanich North and the Islands" },
                { name: "West Vancouver-Sea to Sky" },
              ],
            },
            {
              name: "Municipal",
              children: [
                { name: "Chloe Brown for Toronto Mayor" },
                {
                  name: "Dianne Saxe for Toronto City Council Ward 11 University—Rosedale",
                },
              ],
            },
          ],
        });
      } catch {
        console.log("Not creating new orgs. They probably already exists.");
        return undefined;
      }
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function AddFakeDataButton(): JSX.Element {
  const addFakeContacts = useAddFakeContacts();
  const addFakeOrganizations = useAddFakeOrganizations();

  return (
    <Button
      onClick={() => {
        void (async (): Promise<void> => {
          await addFakeOrganizations.mutateAsync();
          const orgs = OrganizationsDTO.fromFetchOrThrow(
            await grassrootsAPI.GET("/organizations"),
          ).organizations;
          void addFakeContacts.mutateAsync(orgs.map((x) => x.id));
        })();
      }}
    >
      Add fake data.
    </Button>
  );
}
