import { JSX } from "react";
import { AdminTable } from "./AdminTable";

export interface sampleTableDataType {
  orgName: string;
  parentOrg: string;
  abbrName: string;
  desc: string;
}

const sampleTableData: sampleTableDataType[] = [
  {
    orgName: "Test_BarrieSpringwaterOM",
    parentOrg: "Test_GPO",
    abbrName: "Test_BSOM",
    desc: "An interesting place with people who live in Barrie and surrounding communities.",
  },
  {
    orgName: "Test_DonValleyEast",
    parentOrg: "Test_GPO",
    abbrName: "Test_DVE",
    desc: "A diverse low-middle class riding.",
  },
];

export function AdminPage(): JSX.Element {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <AdminTable tableData={sampleTableData} />
    </div>
  );
}
