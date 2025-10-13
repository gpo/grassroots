import { Button } from "@mantine/core";
import { JSX } from "react";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { OrganizationsDTO } from "grassroots-shared/dtos/Organization.dto";
import { useAddFakeOrganizations } from "../Logic/UseFakeOrganizations.js";
import { useAddFakeContacts } from "../Logic/UseAddFakeContacts.js";

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
