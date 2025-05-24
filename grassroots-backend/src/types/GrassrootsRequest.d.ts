import { Request } from "express";
import { UserEntity } from "../grassroots-shared/User.entity";

export type GrassrootsRequest = Request & UserEntity;
