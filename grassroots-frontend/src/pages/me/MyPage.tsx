import { JSX } from "react";
import { MyTable } from "./MyTable";
import { OrganizationDTO } from "../../grassroots-shared/Organization.dto";

type OrgDTOPlain = Omit<OrganizationDTO, "__DTOBrand" | "__caslSubjectType">;

export interface sampleTableDataType extends OrgDTOPlain {
  abbrName?: string;
  desc?: string;
}

const sampleTableData: sampleTableDataType[] = [
  {
    id: 10,
    name: "Test_Green Party of Ontario",
    abbrName: "Test_GPO",
    desc: "The Green Party in Ontario, with some of the best policies and organization in the country.",
  },
  {
    id: 11,
    name: "Test_BarrieSpringwaterOM",
    parentId: 10,
    abbrName: "Test_BSOM",
    desc: "An interesting place with people who live in Barrie and surrounding communities.",
  },
  {
    id: 12,
    name: "Test_DonValleyEast",
    parentId: 10,
    abbrName: "Test_DVE",
    desc: "A diverse low-middle class riding.",
  },
];

export function MyPage(): JSX.Element {
  return (
    <div>
      <h2>My Dashboard</h2>
      <MyTable tableData={sampleTableData} />
    </div>
  );
}
