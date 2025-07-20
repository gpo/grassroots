/* eslint-disable check-file/no-index */
import { rule as dtoAndEntityStyle } from "./dto-and-entity-style.js";
import { rule as entityUse } from "./entity-use.js";

const rules = {
  "dto-and-entity-style": dtoAndEntityStyle,
  "entity-use": entityUse,
};

export default rules;
