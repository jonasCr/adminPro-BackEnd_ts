import express, { Request } from 'express';
let app = express();

import * as auth from './../middleware/auth';

import {Hospital} from './../models/mongoose/'
import { HospitalModel, CustomRequest } from '../models/interfaces';
import { Response } from '../models';

/**
 * Devuelve la lista de los hospitales
 */
app.get('/', (req:CustomRequest, res) => {
    let startFrom = req.query.startWith || 0
    startFrom = Number(startFrom);

    Hospital.find({})
        .skip(startFrom)
        .limit(5)
        .populate('updatedBy', 'name email')
        .exec(
            (err, hospitals:HospitalModel) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error en la base de datos',
                        errors: err
                    })
                }

                Hospital.count({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error en la base de datos',
                            errors: err
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        result: hospitals,
                        total: count
                    })
                })


            })



})

/**
 * Crea un hospital y lo devuelve
 */
app.post('/', auth.checkToken, (req:CustomRequest, res) => {
    let body = req.body;
    let userlogged = req.user

    let hospital = new Hospital({
        name: body.name,
        updatedBy: userlogged._id,
        image: body.image,
    })

    hospital.save((err, newHospital:HospitalModel) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al crear el hospital',
                errors: err
            })
        }

        res.status(200).json({
            ok: true,
            result: newHospital,
        })

    })

})

/**
 * Actualiza un hospital y lo devuelve
 */
app.put('/:id', auth.checkToken, (req:CustomRequest, res) => {
    let id = req.params.id
    let body:HospitalModel = req.body;
    let userlogged = req.user;

    Hospital.findById(id, (err, hospital:HospitalModel) => {

        let response = new Response<HospitalModel>(err,hospital);

        if (response.error) {
            return res.status(response.getStatus()).json({response})
        }


        /*
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al buscar el hospital',
                errors: err
            })
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                result: `El hospital con id ${id} no existe`
            })
        }*/
        hospital.name = body.name ? body.name : hospital.name;
        hospital.updatedBy = userlogged._id;


        hospital.save((err:any, updatedHospital:HospitalModel) => {
            response = new Response(err, updatedHospital, 'Hospital guardado');

            return res.status(response.getStatus()).json({response})

            /* 
            if (err) {
                return res.status(400).json({
                    ok: false,
                    result: 'Error al actualizar el hospital',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                result: updatedHospital
            })*/
        })
    })

});

/**
 * Elimina un hospital y devuelve el hospital eliminado
 */
app.delete('/:id', auth.checkToken, (req:CustomRequest, res) => {
    let id = req.params.id
    let userlogged = req.user;

    Hospital.findByIdAndRemove(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                result: 'Error al eliminar el usuario',
                errors: err
            })
        }


        if (!deletedHospital) {
            return res.status(400).json({
                ok: false,
                result: `El hospital con id ${id} no existe`
            })
        }

        res.status(200).json({
            ok: true,
            result: deletedHospital,
        })
    })

})




export default app