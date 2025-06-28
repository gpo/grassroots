import { Request } from "express";
import { UserEntity } from "../users/User.entity";

export type GrassrootsRequest = Request & UserEntity;
