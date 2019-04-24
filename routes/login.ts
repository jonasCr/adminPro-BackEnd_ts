import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import SEED from './../config/config'

let app = express();

import {User} from '../models/mongoose';
import { UserModel, CustomRequest } from '../models/interfaces';
import { ResponseCustom } from '../models';

app.post('/', (req:CustomRequest, res) => {

    let body = req.body;

    User.findOne({ email: body.userName }, (err, user:UserModel) => {

        let response = new ResponseCustom<UserModel>(err, user)

        /*
        //Si occure un error en la BBDD
        if (err) {
            return res.status(500).json({
                ok: false,
                result: `Error al encontrar el usuario ${body.userName}`,
                errors: err
            })
        }

        //Si no existe el usuario en la BBDD
        if (!user) {
            return res.status(400).json({
                ok: false,
                result: `No existe el usuario ${body.userName}`
            })
        }
        */
        //Si la contraseña es incorrecta
        if (!bcrypt.compareSync(body.password, user.password)) {
            response.result = null
            return res.status(400).json({
                ok: false,
                result: 'La contraseña es incorrecta',
            })
        }

        user.password = "NOPE";
        //Crear el token
        let token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) //4 horas

        res.status(200).json({
            ok: true,
            token: token,
            result: user
        })
    })


})

export default app;