import { Document } from "mongoose";

export interface DoctorModel extends Document{
    name:string,
    user:string,
    hospital: string,
    image?:string
}
