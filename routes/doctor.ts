import { DoctorModel, CustomRequest } from "../models/interfaces";

import express, { Response } from 'express';
let app = express();

import * as auth from './../middleware/auth';

import {Doctor} from './../models/mongoose'

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
app.post('/', auth.checkToken, (req:CustomRequest, res:Response) => {
    let test = req.query
    let body = req.body;
    let userlogged = req.user

    let doctor = new Doctor({
        name: body.name,
        image: body.image,
        user: body.user,
        hospital: body.hospital,
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
app.put('/:id', auth.checkToken, (req:CustomRequest, res:Response) => {
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
        doctor.hospital = body.hospital ? body.hospital : doctor.hospital;
        doctor.user = body.user ? body.user : doctor.user;
        doctor.updatedBy = userlogged._id
        doctor.save((err:any, updatedDoctor:DoctorModel) => {
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
app.delete('/:id', auth.checkToken, (req:CustomRequest, res:any) => {
    let id = req.params.id
    let userlogged = req.user;

    Doctor.findByIdAndRemove(id, (err:any, deletedDoctor) => {
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