import mongoose, { Model, model } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { UserModel } from '../interfaces';

let Schema = mongoose.Schema;


let validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

//Creamos el modelo
const userSchema = new Schema({
    //Mesage en caso de error 
    name: { type: String, required: [true, 'El nombre es necesario'], },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'], },
    password: { type: String, required: [true, 'La contraseña es necesario'], },
    image: { type: String, required: false, },
    role: { type: String, required: true, default: 'USER_ROLE', enum: validRoles },
    createdBy: { type: String, required: true }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} ya existe' });

//Exportamos el modelo
//El nombre de la collaection en mongoose
export const User: Model<UserModel> = model<UserModel>('User', userSchema)