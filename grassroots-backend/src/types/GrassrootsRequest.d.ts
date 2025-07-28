import { Request } from "express";
import { UserDTO } from "@grassroots/shared";

export type GrassrootsRequest = Request & UserDTO;
