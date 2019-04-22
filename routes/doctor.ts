import { DoctorModel } from "../models/interfaces";

let express = require('express');
let app = express();
let bcrypt = require('bcryptjs');

let auth = require('./../middleware/auth');

// let jwt = require('jsonwebtoken');

// const SEED = require('./../config/config').SEED

import {Doctor} from './../models/mongoose'
let User = require('./../models/user')

//Main logic
/**
 * Devuelve la lista de los hospitales
 */
app.get('/', (req:any, res:any) => {
    let startFrom = req.query.startWith || 0
    startFrom = Number(startFrom);

    Doctor.find({})
        .skip(startFrom)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec(
            (err, doctors:DoctorModel) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en la base de datos',
                        errors: err
                    })
                }

                Doctor.count({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error en la base de datos',
                            errors: err
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        result: doctors,
                        total: count
                    })


                })

            })



})

/**
 * Crea un Doctor y lo devuelve
 */
app.post('/', auth.checkToken, (req:any, res:any) => {
    let test = req.query
    let body = req.body;
    let userlogged = req.user

    let doctor = new Doctor({
        name: body.name,
        image: body.image,
        idUser: body.idUser,
        idHospital: body.idHospital,
    })

    doctor.save((err:any, newDoctor:DoctorModel) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al crear el doctor',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            result: newDoctor,
        })

    })

})

/**
 * Actualiza un Doctor y lo devuelve
 */
app.put('/:id', auth.checkToken, (req:any, res:any) => {
    let id = req.params.id
    let body = req.body;
    let userlogged = req.user;

    Doctor.findById(id, (err:any, doctor:DoctorModel) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al buscar el doctor',
                errors: err
            })
        }
        if (!doctor) {
            return res.status(400).json({
                ok: false,
                result: `El doctor con id ${id} no existe`
            })
        }
        doctor.name = body.name ? body.name : doctor.name;
        doctor.image = body.image ? body.image : doctor.image;
        doctor.hospital = body.idHospital ? body.idHospital : doctor.idHospital;
        doctor.user = body.idUser ? body.idUser : doctor.idUser;
        doctor.save((err:any, updatedDoctor:any) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    result: 'Error al actualizar el usuario',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                result: updatedDoctor
            })
        })
    })
});

/**
 * Elimina un Doctor y devuelve el Doctor eliminado
 */
app.delete('/:id', auth.checkToken, (req:any, res:any) => {
    let id = req.params.id
    let userlogged = req.user;

    Doctor.findByIdAndRemove(id, (err:any, deletedDoctor:DoctorModel) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al eliminar el doctor',
                errors: err
            })
        }

        if (!deletedDoctor) {
            return res.status(400).json({
                ok: false,
                result: `El Doctor con id ${id} no existe`
            })
        }
        res.status(200).json({
            ok: true,
            result: deletedDoctor,
        })
    })
})




export default app