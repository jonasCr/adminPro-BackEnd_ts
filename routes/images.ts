import { CustomRequest } from "../models";

import express from 'express';
let app = express();
import path from 'path';
import fs from 'fs';


//Rutas
app.get('/:model/:fileName', (req:CustomRequest, res, next) => {

    let model:string = req.params.model;
    let fileName:string = req.params.fileName;


    if (!isModelValid(model)) {
        return res.status(400).json({
            ok: false,
            message: 'El modelo ' + model + ' no es valido'
        })
    }


    //let path = `contents/${model}/${fileName}`;

    let url = path.resolve(__dirname, `./../contents/${model}/${fileName}`);
    let urlDefault = path.resolve(__dirname, `./../contents/${model}/default.png`);

    fs.existsSync(url) ? res.sendFile(url) : res.sendFile(urlDefault);

})

function isModelValid(model:string) {
    let validModel = ['doctors', 'users', 'hospitals'];
    return validModel.includes(model);
}


export default app