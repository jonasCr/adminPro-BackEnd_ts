import express, { Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import fs from 'fs';
const app = express();

import {User} from './../models/mongoose/user' ;
import {Doctor} from './../models/mongoose/doctor' ;
import {Hospital} from './../models/mongoose/hospital' ;
import { DoctorModel, CustomRequest, UserModel, HospitalModel } from '../models';




app.use(fileUpload());

/**
 * Upload the file in the server depending of the model that we pass
 */
app.put('/:model/:id', (req:CustomRequest, res:any) => {

    let model:string = req.params.model;
    let id:string = req.params.id;


    //Comprobamos si el modelo existe
    if (!isModelValid(model)) {
        res.status(400).json({
            ok: false,
            result: `El modelo ${model} no esta acceptado`
        })
    }


    //Comprobamos que el usuario envia un fichero
    if (!req.files) {
        res.status(400).json({
            ok: false,
            result: 'No ha selecionado ningun archivo'
        })
    }

    let file:any = req.files.file;
    let fileType = getFileType(file)

    //Comprobamos que la extension es valida
    if (!isTypeAccepted(fileType)) {
        res.status(400).json({
            ok: false,
            result: `El tipo ${fileType} no esta acceptado`
        })
    }

    //Creamos un nombre unico para el fichero
    let fileName = `${id}-${new Date().getMilliseconds()}.${fileType}`;
    let path = `./contents/${model}/${fileName}`;

    file.mv(path, (err:any) => {
        if (err) {
            res.status(500).json({
                ok: false,
                result: 'Error al guardar el archivo',
                errors: err
            })
        }

        uploadByModel(model, id, fileName, res);
        // res.status(200).json({
        //     ok: true,
        //     result: path
        // })
    })


})

function getFileType(file:any) {
    let nameA = file.name.split('.');
    return nameA[nameA.length - 1]
}

function isTypeAccepted(type:string) {
    let acceptedTypes = ['png', 'jpg', 'gif', 'jpeg'];
    return acceptedTypes.includes(type);
}

function isModelValid(model:string) {
    let validModel = ['doctors', 'users', 'hospitals'];
    return validModel.includes(model);
}

function handleError(err, res, message) {
    if (err) {
        return res.status(500).json({
            ok: false,
            error: err,
            message: message
        })
    }
}

function uploadByModel(model:string, id:string, fileName:string, res:Response) {
    switch (model) {
        case 'users':
            User.findById(id, (err, user:UserModel) => {

                //Si el usuario no existe en la base de datos, borramos el fichero guardado
                if (!user) {
                    fs.unlink('./contents/users/' + fileName, e => {
                        console.error(e)
                    })
                    return res.status(400).json({
                        ok: false,
                        message: 'No existe usuario con el id: ' + id
                    })
                }

                let oldPath = `./contents/users/${user.image}`;

                //Si existe la imagen la eliminamos
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath,err => console.error(err))
                }


                //Actualizamos el usuario
                user.image = fileName;
                user.save((err, updatedUser:UserModel) => {
                    updatedUser.password = 'NOPE';
                    return res.status(200).json({
                        ok: true,
                        result: 'User image saved',
                        user: updatedUser
                    })
                })

            })
            break;
        case 'doctors':
            Doctor.findById(id, (err, doctor:DoctorModel) => {

                //Si el doctor no existe en la base de datos, borramos el fichero guardado
                if (!doctor) {
                    fs.unlink('./contents/doctors/' + fileName, e => {
                        //
                    })
                    return res.status(400).json({
                        ok: false,
                        message: 'No hay doctor con el id: ' + id,
                    })
                }


                //Si existe la imagen la eliminamos
                let oldPath = `./contents/doctors/${doctor.image}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, err => {
                        handleError(err, res, 'Error al eliminar el archivo anterior')
                    })
                }

                //Actualizamos el registro
                doctor.image = fileName;
                doctor.save((err, updatedDoctor:DoctorModel) => {
                    return res.status(200).json({
                        ok: true,
                        result: 'Doctor image saved',
                        doctor: updatedDoctor
                    })
                })

            })
            break;
        case 'hospitals':
            Hospital.findById(id, (err, hospital:HospitalModel) => {
                //Si el hospital no existe en la base de datos, borramos el fichero guardado
                if (!hospital) {
                    fs.unlink('./contents/hospitals/' + fileName, e => {
                        if (e) console.error(e)
                    })
                    return res.status(400).json({
                        ok: false,
                        message: 'No hay hospital con el id: ' + id,
                    })
                }

                let oldPath = `./contents/hospitals/${hospital.image}`;

                //Si existe la imagen la eliminamos
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, err => {
                        handleError(err, res, 'Error al eliminar el archivo anterior')
                    })
                }

                //Actualizamos el registro
                hospital.image = fileName;
                hospital.save((err, updatedHospital:HospitalModel) => {
                    if (err) {
                        fs.unlink('./contents/hospitals/' + fileName, e => {
                            console.error(e)
                        })
                        handleError(err, res, 'Ha suregido un error')
                    }
                    return res.status(200).json({
                        ok: true,
                        result: 'Hospital image saved',
                        hospital: updatedHospital
                    })
                })

            })
            break;
    }
}

export default app