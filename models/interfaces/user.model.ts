import { Document } from "mongoose";

export enum Role {
    admin = 'ADMIN_ROLE',
    user = 'USER_ROLE'
}

export interface UserModel extends Document{
    name: string,
    email: string,
    password: string,
    image?: string,
    role: Role,
    createdBy?: string
}