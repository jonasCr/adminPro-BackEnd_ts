import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let hospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    image: { type: String, required: false },
    //El modelo
    updatedBy: { type: Schema.Types.ObjectId, ref: 'user' }
}, { collection: 'hospitals' });


export default mongoose.model('hospital', hospitalSchema)