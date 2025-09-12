import { Request } from "express";
import { UserDTO } from "grassroots-shared/dtos/User.dto";

export type GrassrootsRequest = Request & UserDTO;
