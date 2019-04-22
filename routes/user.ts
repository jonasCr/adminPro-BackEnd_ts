import express from 'express';
let app = express();
import bcrypt from 'bcryptjs';

import * as auth from './../middleware/auth'


import User from '../models/mongoose/user'


/**
 * Obtiene todo los usuarios de la base de datos
 */
app.get('/', (req:any, res:any) => {

    let startFrom = req.query.startWith || 0
    startFrom = Number(startFrom);

    User.find({}, 'name email image role')
        .skip(startFrom)
        .limit(5)
        .exec(
            (err:any, user:any) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en base de datos',
                        errors: err
                    })
                }

                User.count({}, (err:any, count:any) => {
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
app.post('/', auth.checkToken, (req:any, res:any) => {
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

    user.save((err:any, newUser:any) => {
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
    })

});

/**
 * Actualiza un usuario y lo devuelve
 */

app.put('/:id', auth.checkToken, (req:any, res:any) => {

    let id = req.params.id;
    let body = req.body;
    let userlogged = req.user

    User.findById(id, (err:any, user:any) => {
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
        }

        user.name = body.name;
        user.email = body.email;
        user.role = user.role;

        user.save((err:any, updatedUser:any) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    result: 'Error al actualizar el usuario',
                    errors: err
                })
            }

            updatedUser.password = '';

            res.status(200).json({
                ok: true,
                result: updatedUser
            })
        })

    })

})

/**
 * Elimina un usuario y devuelve el usuario eliminado
 */
app.delete('/:id', auth.checkToken, (req:any, res:any) => {
    let id = req.params.id;
    let userlogged = req.user

    User.findByIdAndRemove(id, (err:any, deletedUser:any) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al eliminar el usuario',
                errors: err
            })
        }


        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                result: `El usuario con id ${id} no existe`
            })
        }

        res.status(200).json({
            ok: true,
            result: deletedUser,
        })
    })
})


export default app