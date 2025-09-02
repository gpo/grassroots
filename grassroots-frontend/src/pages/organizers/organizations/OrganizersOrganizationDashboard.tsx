import { JSX } from "react";
import { OrganizersOrganizationMembersTable } from "./OrganizersOrganizationMembersTable";
import { useParams } from "@tanstack/react-router";
import { Route as OrgRoute } from "../../../routes/Organizers/$organizationId";

export interface sampleTableDataType {
  memberID: string;
  fname: string;
  lname: string;
  address: string;
  role: "Candidate" | "Volunteer" | "Financial Agent/ CFO" | "CEO/President";
}

const sampleTableData: sampleTableDataType[] = [
  {
    memberID: "1234",
    fname: "Test",
    lname: "Candidate",
    address: "123 abc st.",
    role: "Candidate",
  },
  {
    memberID: "1234",
    fname: "Test",
    lname: "CFO",
    address: "1223 abcd st.",
    role: "Financial Agent/ CFO",
  },
];

export function OrganizersOrganizationDashboard(): JSX.Element {
  const { organizationId } = useParams({ from: OrgRoute.id });
  return (
    <div>
      <h2>Organization {organizationId} Dashboard</h2>
      <OrganizersOrganizationMembersTable tableData={sampleTableData} />
    </div>
  );
}
