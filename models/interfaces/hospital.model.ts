import { Document } from "mongoose";

export interface HospitalModel extends Document{
    name:string,
    image?: string,
    updatedBy: string
}