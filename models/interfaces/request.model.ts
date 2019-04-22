import { Request } from "express";
import { UserModel } from "./user.model";

export interface CustomRequest extends Request {
    user?:UserModel
}