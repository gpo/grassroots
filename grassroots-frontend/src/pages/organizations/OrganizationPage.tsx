import { JSX } from "react";
import { OrganizationMembersTable } from "./OrganizationMembersTable";
import { useParams } from "@tanstack/react-router";
import { Route as OrgRoute } from "../../routes/Organizations/$organizationId";
import { UserDTO } from "../../grassroots-shared/User.dto";

export interface sampleTableDataType
  extends Pick<UserDTO, "id" | "firstName" | "lastName" | "emails"> {
  role: "Candidate" | "Volunteer" | "Financial Agent/ CFO" | "CEO/President";
}

const sampleTableData: sampleTableDataType[] = [
  {
    id: "1234",
    firstName: "Test",
    lastName: "Candidate",
    emails: ["testcandidate@gpo.ca"],
    role: "Candidate",
  },
  {
    id: "12345",
    firstName: "Test",
    lastName: "CFO",
    emails: ["testcfo@gpo.ca"],
    role: "Financial Agent/ CFO",
  },
];

export function OrganizationDashboard(): JSX.Element {
  const { organizationId } = useParams({ from: OrgRoute.id });
  // TODO: Change title from Org [orgid] to just [Org Name]
  return (
    <div>
      <h2>Organization {organizationId}</h2>
      <OrganizationMembersTable tableData={sampleTableData} />
    </div>
  );
}
