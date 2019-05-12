import express, { Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import path from 'path'
const app = express();

import {User} from './../models/mongoose/user' ;
import {Doctor} from './../models/mongoose/doctor' ;
import {Hospital} from './../models/mongoose/hospital' ;
import { DoctorModel, CustomRequest, UserModel, HospitalModel, ResponseCustom, Model } from '../models';
import { MongooseDocument } from 'mongoose';




app.use(fileUpload());

/**
 * Upload the file in the server depending of the model that we pass
 */
app.put('/:model/:id', (req:CustomRequest, res:any) => {

    let model:Model = req.params.model;
    let id:string = req.params.id;


    //Comprobamos si el modelo existe
    if (!isModelValid(model)) {
        return res.status(400).json({
            ok: false,
            result: `El modelo ${model} no esta acceptado`
        })
    }


    //Comprobamos que el usuario envia un fichero
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            result: 'No ha selecionado ningun archivo'
        })
    }

    let file:any = req.files.file;
    let fileType = getFileType(file)

    //Comprobamos que la extension es valida
    if (!isTypeAccepted(fileType)) {
        return res.status(400).json({
            ok: false,
            result: `El tipo ${fileType} no esta acceptado`
        })
    }

    //Creamos un nombre unico para el fichero
    let fileName = `${id}-${new Date().getMilliseconds()}.${fileType}`;
    let url = path.resolve(__dirname, `./../contents/${model}/${fileName}`); 

    file.mv(url, (err:any) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al guardar el archivo',
                errors: err
            })
        }

        uploadByModel(model, id, fileName, res);
 
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
    //return validModel.includes(model);
    return Model[model] != null
}


function uploadByModel(model:Model, id:string, fileName:string, res:Response) {
    let document:any;
    let literal:string;
    switch (model) {
        case Model.user:
            document = User;
            literal = 'usuario';
            break;
        case Model.doctor:
            document = Doctor;
            literal = 'doctor'
            
            break;
        case Model.hopital:
        document = Hospital;
        literal = 'hospital'
        
            break;
    }

    document.findById(id, (err, doc) => {

        if (err){
            let response = new ResponseCustom<any>(err);
            return res.status(response.getStatus()).json(response);
        }

        //Si el documento no existe en la base de datos, borramos el fichero guardado
        if (!doc) {
            let url = path.resolve(__dirname,`./../contents/${model}/${fileName}`);
            fs.unlink(url, e => {
                console.error(e)
            })
            return res.status(400).json({
                ok: false,
                message: `No existe ${literal} con el id: ${id}`
            })
        }

        let oldPath = path.resolve(__dirname,`./../contents/${model}/${doc.image}`);
        //Si existe la imagen la eliminamos
        if (fs.existsSync(oldPath)) {
            fs.unlink(oldPath,err => console.error(err))
        }


        //Actualizamos el usuario
        doc.image = fileName;
        doc.save((err, updatedDoc:any) => {
            if (updatedDoc.password) updatedDoc.password = '****';
            return res.status(200).json({
                ok: true,
                confirm: `Imagen del ${literal} guardada`,
                result: updatedDoc
            })
        })

    })
}

export default app