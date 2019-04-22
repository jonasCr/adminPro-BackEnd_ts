import mongoose, { Model, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

import Schema = mongoose.Schema;
import { DoctorModel } from '../interfaces';

let doctorSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    image: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: [true, 'El id hospital es un campo obligatorio ']
    }
}, { collection: 'doctors' })

export const Doctor: Model<DoctorModel> = model<DoctorModel>('doctor', doctorSchema)