import jwt from 'jsonwebtoken';

import SEED from './../config/config'
import { CustomRequest } from '../models';

//const SEED = require('./../config/config').SEED

/**
 * Comprueba el token enviado por el front
 */

export function checkToken(req:CustomRequest, res:any, next:any) {
    let token = req.query.token;

    jwt.verify(token, SEED, (err:any, decoded:any) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token invalid',
                errors: err
            })
        }

        //Se añade a la request, el usuario que hace la petición
        req.user = decoded.user

        next();
    })
}

