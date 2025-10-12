import { faker } from "@faker-js/faker";
import {
  UseMutationResult,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { createOrganizationTree } from "grassroots-shared-net/devtools/CreateOrganizationTree";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";

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
