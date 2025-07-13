import { Request } from "express";
import { UserDTO } from "../grassroots-shared/User.dto";

export type GrassrootsRequest = Request & UserDTO;
