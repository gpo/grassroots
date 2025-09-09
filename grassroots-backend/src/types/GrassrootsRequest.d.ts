import { Request } from "express";
import { UserDTO } from "../grassroots-shared/User.dto.js";

export type GrassrootsRequest = Request & UserDTO;
