import express from 'express';
let app = express();
import bcrypt from 'bcryptjs';

import * as auth from './../middleware/auth'


import {User} from '../models/mongoose/user'
import { CustomRequest, UserModel, ResponseCustom } from '../models';


/**
 * Obtiene todo los usuarios de la base de datos
 */
app.get('/', (req:CustomRequest, res:any) => {

    let startFrom = req.query.startWith || 0
    startFrom = Number(startFrom);

    User.find({}, 'name email image role')
        .skip(startFrom)
        .limit(5)
        .exec(
            (err:any, user:UserModel) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en base de datos',
                        errors: err
                    })
                }

                User.count({}, (err:any, count:number) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error en base de datos',
                            errors: err
                        })
                    }
                    res.status(400).json({
                        ok: true,
                        result: user,
                        total: count
                    })
                })
            })
})

/**
 * Crea una nuevo usuario y lo devuelve
 */
app.post('/', auth.checkToken, (req:CustomRequest, res) => {
    let body = req.body;
    let userlogged = req.user

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        image: body.image,
        role: body.role,
        createdBy: req.user._id
    })

    user.save((err:any, newUser:UserModel) => {

        let response  = new ResponseCustom<UserModel>(err,newUser, `Usuario creado correctamente`);
        /*
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al crear el usuario',
                errors: err
            })
        }

        res.status(201).json({
            ok: true,
            result: newUser,
        })
        */

        res.status(response.getStatus()).json(response);
    })

});

/**
 * Actualiza un usuario y lo devuelve
 */

app.put('/:id', auth.checkToken, (req:CustomRequest, res:any) => {

    let id = req.params.id;
    let body = req.body;
    let userlogged = req.user

    User.findById(id, (err:any, user:UserModel) => {

        let response = new ResponseCustom<UserModel>(err,user);
        /*
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al buscar el usuario',
                errors: err
            })
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                result: `El usuario con id ${id} no existe`
            })
        }*/

        if (!response.error){
            user.name = body.name ? body.name : user.name;
            user.email = body.email ? body.email: user.email;
            user.role = user.role ?user.role : user.role;
            user.createdBy = userlogged._id
    
            user.save((err:any, updatedUser:UserModel) => {
    
                updatedUser.password = '****';
    
                response = new ResponseCustom<UserModel>(err, updatedUser, 'El usuario se ha guardado correctamente');

                console.log('save')
                /*
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        result: 'Error al actualizar el usuario',
                        errors: err
                    })
                }
    
                */
               res.status(response.getStatus()).json(response);

    
            })
        }
    })

})

/**
 * Elimina un usuario y devuelve el usuario eliminado
 */
app.delete('/:id', auth.checkToken, (req:CustomRequest, res:any) => {
    let id = req.params.id;
    let userlogged = req.user

    User.findByIdAndRemove(id, (err:any, deletedUser:UserModel) => {

        let response = new ResponseCustom<UserModel>(err,deletedUser,'El usuario ha sido eliminado correctamente')
       
        res.status(response.getStatus()).json(response)
    })
})


export default app