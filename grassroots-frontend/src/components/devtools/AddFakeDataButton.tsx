import { Button } from "@mantine/core";
import { JSX } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI";
import { CreateContactRequestDTO } from "../../grassroots-shared/Contact.dto";
import { faker } from "@faker-js/faker";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { OrganizationsDTO } from "../../grassroots-shared/Organization.dto";

function getRandomContact(orgId: number): CreateContactRequestDTO {
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
    organizationId: orgId,
  });
}

function useAddFakeContacts(): UseMutationResult<
  {
    ids: number[];
  },
  Error,
  number
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgId: number) => {
      const contacts = [];

      for (let i = 0; i < 100; ++i) {
        contacts.push(getRandomContact(orgId));
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
        const rootResult = await grassrootsAPI.POST(
          "/organizations/create-root",
          {
            body: {
              name: "Root Organization",
              abbreviatedName: "Root Org",
              description: "The root organization",
            },
          },
        );

        if (rootResult.error) {
          console.log("Not creating new orgs, as the root org already exists.");
          return;
        }

        const results: {
          id: number;
          name: string;
          parentId?: number | undefined;
        }[] = [];
        for (const org of [
          { name: "a", abbreviatedName: "a", description: "a" },
          { name: "b", abbreviatedName: "b", description: "b" },
          { name: "c", abbreviatedName: "c", description: "c" },
        ]) {
          const result = await grassrootsAPI.POST("/organizations", {
            body: { ...org, parentID: rootResult.data.id },
          });
          if (result.error) {
            console.log("Not creating new org. It probably already exists.");
            return undefined;
          }
          results.push(result.data);
        }
        return [rootResult.data, ...results];
      } catch {
        console.log("Not creating new org. It probably already exists.");
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
          const firstOrg = orgs[0];
          if (firstOrg === undefined) {
            throw new Error("No organizations");
          }
          void addFakeContacts.mutateAsync(firstOrg.id);
        })();
      }}
    >
      Add fake data.
    </Button>
  );
}
