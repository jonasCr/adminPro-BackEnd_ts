import { DoctorModel, CustomRequest } from "../models/interfaces";
import express, { Response } from 'express';
let app = express();

import * as auth from './../middleware/auth';

import {Doctor} from './../models/mongoose'
import { ResponseCustom } from "../models";

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
                let response:ResponseCustom<DoctorModel> = new ResponseCustom<DoctorModel>(err, doctors)
                /*if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en la base de datos',
                        errors: err
                    })
                }*/

                Doctor.count({}, (err, count) => {
                    response.updateError(err)// = new ResponseCustom<DoctorModel>(err, doctors)
                    if (!response.error) response.count = count;
                    /*
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error en la base de datos',
                            errors: err
                        })
                    }*/
                    res.status(response.getStatus()).json(response);


                })

            })



})

/**
 * Crea un Doctor y lo devuelve
 */
app.post('/', auth.checkToken, (req:CustomRequest, res:Response) => {
    let body:DoctorModel = req.body;
    let userlogged = req.user

    let doctor = new Doctor({
        name: body.name,
        image: body.image,
        user: body.user,
        hospital: body.hospital,
    })

    doctor.save((err:any, newDoctor:DoctorModel) => {
        let response:ResponseCustom<DoctorModel> = new ResponseCustom<DoctorModel>(err, newDoctor, 'Se ha guardado correctamente el doctor '+ newDoctor.name)
        // if (err) {
        //     return res.status(500).json({
        //         ok: false,
        //         result: 'Error al crear el doctor',
        //         errors: err
        //     })
        // }

        res.status(response.getStatus()).json(response)

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
        let response:ResponseCustom<DoctorModel> = new ResponseCustom<DoctorModel>(err, doctor)
        
        if (!response.error){
            doctor.name = body.name ? body.name : doctor.name;
            doctor.image = body.image ? body.image : doctor.image;
            doctor.hospital = body.hospital ? body.hospital : doctor.hospital;
            doctor.user = body.user ? body.user : doctor.user;
            doctor.save((err:any, updatedDoctor:DoctorModel) => {
                response = new ResponseCustom<DoctorModel>(err,updatedDoctor, `Se actualizado correctamente el doctor: ${updatedDoctor.name}`) 
                /*if (err) {
                    return res.status(400).json({
                        ok: false,
                        result: 'Error al actualizar el usuario',
                        errors: err
                    })
                }
                res.status(200).json({
                    ok: true,
                    result: updatedDoctor
                })*/
            })
        }

        res.status(response.getStatus()).json(response)
        /*
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
        }*/
        
    })
});

/**
 * Elimina un Doctor y devuelve el Doctor eliminado
 */
app.delete('/:id', auth.checkToken, (req:CustomRequest, res:any) => {
    let id = req.params.id
    let userlogged = req.user;

    Doctor.findByIdAndRemove(id, (err:any, deletedDoctor) => {

        let response = new ResponseCustom<DoctorModel>(err,deletedDoctor, `Se ha eliminado correctamente el doctor: ${deletedDoctor.name}`)
        /*
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
        }*/
        res.status(response.getStatus()).json(response);
    })
})




export default app