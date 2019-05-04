import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import SEED from './../config/config'

let app = express();

import {User} from '../models/mongoose';
import { UserModel, CustomRequest } from '../models/interfaces';
import { ResponseCustom, ErrorsCustom, Error } from '../models';

app.post('/', (req:CustomRequest, res) => {

    let body = req.body;

    User.findOne({ email: body.userName }, (err, user:UserModel) => {

        let response = new ResponseCustom<UserModel>(err, user);

        let token:string;

        if (!response.error){
            if (!bcrypt.compareSync(body.password, user.password)) {
                response.result = null;
                response.error = new Error(ErrorsCustom.wrongPassword);
                return res.status(response.getStatus()).json(response);
            }
            
            user.password = '****'
            token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) //4 horas
            //Crear el token
            user.token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) //4 horas
            console.log(token);
            response.result = user;

        }
        
        res.status(response.getStatus()).json({response,token})
    })


})

export default app;