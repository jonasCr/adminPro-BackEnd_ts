import mongoose, { model, Model } from 'mongoose';
import { UserModel, HospitalModel } from '../interfaces';

let Schema = mongoose.Schema;

export let hospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    image: { type: String, required: false },
    //El modelo
    updatedBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, { collection: 'hospitals' });

export const Hospital: Model<HospitalModel> = model<HospitalModel>('Hospital', hospitalSchema) //mongoose.model('hospital', hospitalSchema)
