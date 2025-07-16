import { rule as dtoAndEntityStyle } from "./DTOAndEntityStyle.js";
import { rule as entityUse } from "./EntityUse.js";
import { rule as controllerRoutesReturnDTOs } from "./ControllerRoutesReturnDTOs.js";

const rules = {
  "dto-and-entity-style": dtoAndEntityStyle,
  "entity-use": entityUse,
  "controller-routes-return-dtos": controllerRoutesReturnDTOs,
};

export default rules;
